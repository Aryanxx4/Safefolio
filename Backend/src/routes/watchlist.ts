import { Router, Request, Response } from "express";
import { ensureAuthenticated } from "../middleware/auth";
import { pool } from "../db/pool";
import type { AppUser } from "../passport";
import { getQuote } from "../services/finnhub";

const router = Router();

// Get or create simulation for user (separate for historical and realtime)
async function getOrCreateSimulation(userId: number, mode: 'historical' | 'realtime' = 'historical'): Promise<number> {
  const simName = mode === 'historical' ? 'historical' : 'realtime';
  const existing = await pool.query(
    `SELECT id FROM simulations WHERE user_id = $1 AND name = $2 LIMIT 1`,
    [userId, simName]
  );
  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }
  
  // For historical, use date range from equity_prices. For realtime, use current date
  if (mode === 'historical') {
    const dateRange = await pool.query(
      `SELECT MIN(price_date) as min_date, MAX(price_date) as max_date FROM public.equity_prices`
    );
    const minDate = dateRange.rows[0]?.min_date || '2007-01-01';
    const maxDate = dateRange.rows[0]?.max_date || '2012-12-31';
    
    const result = await pool.query(
      `INSERT INTO simulations (user_id, name, "current_date", start_date, end_date)
       VALUES ($1, $2, $3, $3, $4)
       RETURNING id`,
      [userId, simName, minDate, maxDate]
    );
    return result.rows[0].id;
  } else {
    // Realtime mode - doesn't need date tracking, but we'll create it for consistency
    const result = await pool.query(
      `INSERT INTO simulations (user_id, name, "current_date", start_date, end_date)
       VALUES ($1, $2, CURRENT_DATE, CURRENT_DATE, CURRENT_DATE)
       RETURNING id`,
      [userId, simName]
    );
    return result.rows[0].id;
  }
}

// Get historical price for a symbol on a given date
async function getHistoricalPrice(symbol: string, date: string): Promise<number | null> {
  // First try exact date
  let result = await pool.query(
    `SELECT close FROM public.equity_prices
     WHERE stock_symbol = $1 AND price_date = $2
     LIMIT 1`,
    [symbol, date]
  );
  
  if (result.rows.length > 0) {
    return Number(result.rows[0].close);
  }
  
  // If no exact match, find the nearest date (on or before the requested date)
  result = await pool.query(
    `SELECT close FROM public.equity_prices
     WHERE stock_symbol = $1 AND price_date <= $2
     ORDER BY price_date DESC
     LIMIT 1`,
    [symbol, date]
  );
  
  if (result.rows.length > 0) {
    return Number(result.rows[0].close);
  }
  
  // If still no match, get the earliest available date for this symbol
  result = await pool.query(
    `SELECT close FROM public.equity_prices
     WHERE stock_symbol = $1
     ORDER BY price_date ASC
     LIMIT 1`,
    [symbol]
  );
  
  if (result.rows.length > 0) {
    return Number(result.rows[0].close);
  }
  
  return null;
}

// Get user's watchlist with prices
router.get("/", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as AppUser;
    const userId = user.id;
    const { mode } = req.query; // 'historical' or 'realtime'
    const priceMode = mode === 'realtime' ? 'realtime' : 'historical';

    // Get user's watchlist
    const watchlistResult = await pool.query(
      `SELECT symbol, created_at FROM watchlist WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    const watchlistItems = watchlistResult.rows;

    // Get prices for each symbol
    const itemsWithPrices = await Promise.all(
      watchlistItems.map(async (item) => {
        let price: number | null = null;
        let change: number | null = null;
        let changePercent: number | null = null;
        let priceDate: string | null = null;

        if (priceMode === 'realtime') {
          // Try to get real-time price from Finnhub
          const quote = await getQuote(item.symbol);
          if (quote && quote.c > 0) {
            price = quote.c;
            change = quote.c - quote.pc;
            changePercent = ((quote.c - quote.pc) / quote.pc) * 100;
            priceDate = new Date().toISOString().split('T')[0];
          }
        }

        // If real-time failed or historical mode, get historical price
        if (!price || priceMode === 'historical') {
          const simId = await getOrCreateSimulation(userId, 'historical');
          const sim = await pool.query(
            `SELECT "current_date" FROM simulations WHERE id = $1`,
            [simId]
          );
          const currentDate = sim.rows[0]?.current_date;
          if (currentDate) {
            const dateStr = typeof currentDate === 'string' 
              ? currentDate 
              : new Date(currentDate).toISOString().split('T')[0];
            const histPrice = await getHistoricalPrice(item.symbol, dateStr);
            if (histPrice !== null) {
              price = histPrice;
              priceDate = dateStr;
            }
          }
        }

        return {
          symbol: item.symbol,
          price: price,
          change: change,
          changePercent: changePercent,
          priceDate: priceDate,
          mode: price ? priceMode : null,
          addedAt: item.created_at,
        };
      })
    );

    res.json({
      watchlist: itemsWithPrices,
    });
  } catch (error: any) {
    console.error("Get watchlist error:", error);
    res.status(500).json({ error: error.message || "Failed to get watchlist" });
  }
});

// Add symbol to watchlist
router.post("/add", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as AppUser;
    const userId = user.id;
    const { symbol } = req.body;

    if (!symbol || typeof symbol !== 'string') {
      return res.status(400).json({ error: "Invalid symbol" });
    }

    // Check if symbol exists in equity_prices
    const symbolCheck = await pool.query(
      `SELECT DISTINCT stock_symbol FROM public.equity_prices WHERE stock_symbol = $1 LIMIT 1`,
      [symbol.toUpperCase()]
    );

    if (symbolCheck.rows.length === 0) {
      return res.status(404).json({ error: `Symbol ${symbol} not found in database` });
    }

    // Add to watchlist
    const result = await pool.query(
      `INSERT INTO watchlist (user_id, symbol)
       VALUES ($1, $2)
       ON CONFLICT (user_id, symbol) DO NOTHING
       RETURNING id, symbol, created_at`,
      [userId, symbol.toUpperCase()]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({ error: "Symbol already in watchlist" });
    }

    res.json({
      success: true,
      item: {
        symbol: result.rows[0].symbol,
        addedAt: result.rows[0].created_at,
      },
    });
  } catch (error: any) {
    console.error("Add to watchlist error:", error);
    res.status(500).json({ error: error.message || "Failed to add to watchlist" });
  }
});

// Remove symbol from watchlist
router.delete("/remove/:symbol", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as AppUser;
    const userId = user.id;
    const { symbol } = req.params;

    const result = await pool.query(
      `DELETE FROM watchlist WHERE user_id = $1 AND symbol = $2 RETURNING symbol`,
      [userId, symbol.toUpperCase()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Symbol not found in watchlist" });
    }

    res.json({
      success: true,
      message: `Removed ${symbol} from watchlist`,
    });
  } catch (error: any) {
    console.error("Remove from watchlist error:", error);
    res.status(500).json({ error: error.message || "Failed to remove from watchlist" });
  }
});

export default router;

