"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const pool_1 = require("../db/pool");
const finnhub_1 = require("../services/finnhub");
const router = (0, express_1.Router)();
// Get or create simulation for user (separate for historical and realtime)
async function getOrCreateSimulation(userId, mode = 'historical') {
    const simName = mode === 'historical' ? 'historical' : 'realtime';
    const existing = await pool_1.pool.query(`SELECT id FROM simulations WHERE user_id = $1 AND name = $2 LIMIT 1`, [userId, simName]);
    if (existing.rows.length > 0) {
        return existing.rows[0].id;
    }
    // For historical, use date range from equity_prices. For realtime, use current date
    if (mode === 'historical') {
        const dateRange = await pool_1.pool.query(`SELECT MIN(price_date) as min_date, MAX(price_date) as max_date FROM public.equity_prices`);
        const minDate = dateRange.rows[0]?.min_date || '2007-01-01';
        const maxDate = dateRange.rows[0]?.max_date || '2012-12-31';
        const result = await pool_1.pool.query(`INSERT INTO simulations (user_id, name, "current_date", start_date, end_date)
       VALUES ($1, $2, $3, $3, $4)
       RETURNING id`, [userId, simName, minDate, maxDate]);
        return result.rows[0].id;
    }
    else {
        // Realtime mode - doesn't need date tracking, but we'll create it for consistency
        const result = await pool_1.pool.query(`INSERT INTO simulations (user_id, name, "current_date", start_date, end_date)
       VALUES ($1, $2, CURRENT_DATE, CURRENT_DATE, CURRENT_DATE)
       RETURNING id`, [userId, simName]);
        return result.rows[0].id;
    }
}
// Get historical price for a symbol on a given date (or nearest available date)
async function getHistoricalPrice(symbol, date) {
    // First try exact date
    let result = await pool_1.pool.query(`SELECT close FROM public.equity_prices
     WHERE stock_symbol = $1 AND price_date = $2
     LIMIT 1`, [symbol, date]);
    if (result.rows.length > 0) {
        return Number(result.rows[0].close);
    }
    // If no exact match, find the nearest date (on or before the requested date)
    result = await pool_1.pool.query(`SELECT close FROM public.equity_prices
     WHERE stock_symbol = $1 AND price_date <= $2
     ORDER BY price_date DESC
     LIMIT 1`, [symbol, date]);
    if (result.rows.length > 0) {
        return Number(result.rows[0].close);
    }
    // If still no match, get the earliest available date for this symbol (fallback)
    result = await pool_1.pool.query(`SELECT close FROM public.equity_prices
     WHERE stock_symbol = $1
     ORDER BY price_date ASC
     LIMIT 1`, [symbol]);
    if (result.rows.length > 0) {
        return Number(result.rows[0].close);
    }
    return null;
}
// Place order (BUY or SELL)
router.post("/order", auth_1.ensureAuthenticated, async (req, res) => {
    try {
        const user = req.user;
        const { symbol, side, quantity, mode } = req.body; // mode: 'historical' | 'realtime'
        if (!symbol || !side || !quantity || quantity <= 0) {
            return res.status(400).json({ error: "Invalid order parameters" });
        }
        if (side !== "BUY" && side !== "SELL") {
            return res.status(400).json({ error: "Side must be BUY or SELL" });
        }
        const userId = user.id;
        const simId = await getOrCreateSimulation(userId, mode);
        let price;
        if (mode === "historical") {
            const sim = await pool_1.pool.query(`SELECT "current_date" FROM simulations WHERE id = $1`, [simId]);
            const currentDate = sim.rows[0]?.current_date;
            if (!currentDate) {
                return res.status(400).json({ error: "Simulation date not set. Please initialize your simulation." });
            }
            // Format date as YYYY-MM-DD
            const dateStr = typeof currentDate === 'string' ? currentDate : new Date(currentDate).toISOString().split('T')[0];
            const histPrice = await getHistoricalPrice(symbol, dateStr);
            if (!histPrice) {
                // Try to get the earliest available date for this symbol
                const earliestResult = await pool_1.pool.query(`SELECT MIN(price_date) as earliest_date FROM public.equity_prices WHERE stock_symbol = $1`, [symbol]);
                const earliestDate = earliestResult.rows[0]?.earliest_date;
                if (earliestDate) {
                    return res.status(404).json({
                        error: `No price data available for ${symbol} on or before ${dateStr}. Earliest available date: ${earliestDate}. Please advance the simulation date.`
                    });
                }
                return res.status(404).json({ error: `No price data available for ${symbol}` });
            }
            price = histPrice;
        }
        else {
            // Real-time mode: use Finnhub
            const quote = await (0, finnhub_1.getQuote)(symbol);
            if (!quote) {
                return res.status(404).json({ error: `Unable to fetch real-time price for ${symbol}` });
            }
            price = quote.c;
        }
        const totalCost = price * quantity;
        // Check balance for BUY
        if (side === "BUY") {
            const userRow = await pool_1.pool.query(`SELECT balance FROM users WHERE id = $1`, [userId]);
            const balance = Number(userRow.rows[0]?.balance ?? 0);
            if (balance < totalCost) {
                return res.status(400).json({ error: "Insufficient balance" });
            }
        }
        // Check position for SELL
        if (side === "SELL") {
            const pos = await pool_1.pool.query(`SELECT quantity FROM positions WHERE user_id = $1 AND simulation_id = $2 AND symbol = $3`, [userId, simId, symbol]);
            const availableQty = Number(pos.rows[0]?.quantity ?? 0);
            if (availableQty < quantity) {
                return res.status(400).json({ error: "Insufficient shares to sell" });
            }
        }
        // Execute transaction
        await pool_1.pool.query("BEGIN");
        try {
            // Record transaction
            await pool_1.pool.query(`INSERT INTO transactions (user_id, simulation_id, symbol, side, quantity, price)
         VALUES ($1, $2, $3, $4, $5, $6)`, [userId, simId, symbol, side, quantity, price]);
            if (side === "BUY") {
                // Deduct cash
                await pool_1.pool.query(`UPDATE users SET balance = balance - $1 WHERE id = $2`, [totalCost, userId]);
                // Update or create position
                const existing = await pool_1.pool.query(`SELECT quantity, average_price FROM positions
           WHERE user_id = $1 AND simulation_id = $2 AND symbol = $3`, [userId, simId, symbol]);
                if (existing.rows.length > 0) {
                    const oldQty = Number(existing.rows[0].quantity);
                    const oldAvg = Number(existing.rows[0].average_price);
                    const newQty = oldQty + quantity;
                    const newAvg = (oldQty * oldAvg + quantity * price) / newQty;
                    await pool_1.pool.query(`UPDATE positions SET quantity = $1, average_price = $2, updated_at = NOW()
             WHERE user_id = $3 AND simulation_id = $4 AND symbol = $5`, [newQty, newAvg, userId, simId, symbol]);
                }
                else {
                    await pool_1.pool.query(`INSERT INTO positions (user_id, simulation_id, symbol, quantity, average_price)
             VALUES ($1, $2, $3, $4, $5)`, [userId, simId, symbol, quantity, price]);
                }
            }
            else {
                // SELL: Add cash
                await pool_1.pool.query(`UPDATE users SET balance = balance + $1 WHERE id = $2`, [totalCost, userId]);
                // Reduce position
                await pool_1.pool.query(`UPDATE positions SET quantity = quantity - $1, updated_at = NOW()
           WHERE user_id = $2 AND simulation_id = $3 AND symbol = $4`, [quantity, userId, simId, symbol]);
                // Remove position if quantity becomes 0
                await pool_1.pool.query(`DELETE FROM positions WHERE quantity <= 0 AND user_id = $1 AND simulation_id = $2 AND symbol = $3`, [userId, simId, symbol]);
            }
            await pool_1.pool.query("COMMIT");
            res.json({
                success: true,
                order: {
                    symbol,
                    side,
                    quantity,
                    price,
                    totalCost,
                    executedAt: new Date().toISOString(),
                },
            });
        }
        catch (err) {
            await pool_1.pool.query("ROLLBACK");
            throw err;
        }
    }
    catch (error) {
        console.error("Order execution error:", error);
        res.status(500).json({ error: error.message || "Failed to execute order" });
    }
});
// Advance simulation time
router.post("/advance", auth_1.ensureAuthenticated, async (req, res) => {
    try {
        const user = req.user;
        const { days } = req.body; // e.g., 7, 30, 90, 365
        if (!days || days <= 0) {
            return res.status(400).json({ error: "Invalid days parameter" });
        }
        const userId = user.id;
        const simId = await getOrCreateSimulation(userId, 'historical'); // Only advance historical simulation
        const result = await pool_1.pool.query(`UPDATE simulations s
       SET "current_date" = LEAST(
         s."current_date" + ($1 || ' days')::interval,
         s.end_date
       ),
       updated_at = NOW()
       WHERE s.id = $2 AND s.name = 'historical'
       RETURNING s."current_date", s.start_date, s.end_date`, [days.toString(), simId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Simulation not found" });
        }
        res.json({
            success: true,
            simulation: {
                currentDate: result.rows[0].current_date,
                startDate: result.rows[0].start_date,
                endDate: result.rows[0].end_date,
            },
        });
    }
    catch (error) {
        console.error("Advance time error:", error);
        res.status(500).json({ error: error.message || "Failed to advance time" });
    }
});
// Get current simulation state
router.get("/simulation", auth_1.ensureAuthenticated, async (req, res) => {
    try {
        const user = req.user;
        const userId = user.id;
        const { mode } = req.query; // Get mode from query: 'historical' or 'realtime'
        const simMode = (mode === 'realtime' ? 'realtime' : 'historical');
        const simId = await getOrCreateSimulation(userId, simMode);
        const result = await pool_1.pool.query(`SELECT id, name, "current_date", start_date, end_date, created_at, updated_at
       FROM simulations WHERE id = $1`, [simId]);
        res.json({ simulation: result.rows[0] || null });
    }
    catch (error) {
        console.error("Get simulation error:", error);
        res.status(500).json({ error: error.message || "Failed to get simulation" });
    }
});
// Get historical price data for chart
router.get("/historical/:symbol", auth_1.ensureAuthenticated, async (req, res) => {
    try {
        const { symbol } = req.params;
        const { startDate, endDate } = req.query;
        const user = req.user;
        const userId = user.id;
        const simId = await getOrCreateSimulation(userId, 'historical'); // Historical prices use historical simulation
        const sim = await pool_1.pool.query(`SELECT "current_date" FROM simulations WHERE id = $1`, [simId]);
        const currentDateRaw = sim.rows[0]?.current_date;
        const currentDate = currentDateRaw
            ? (typeof currentDateRaw === 'string' ? currentDateRaw : new Date(currentDateRaw).toISOString().split('T')[0])
            : "2007-01-01";
        const query = `
      SELECT price_date, close, open, high, low, volume
      FROM public.equity_prices
      WHERE stock_symbol = $1
        AND price_date <= $2
      ORDER BY price_date ASC
      LIMIT 1000
    `;
        const result = await pool_1.pool.query(query, [symbol, currentDate]);
        res.json({
            symbol,
            currentDate,
            prices: result.rows.map((row) => ({
                date: row.price_date,
                close: Number(row.close),
                open: Number(row.open),
                high: Number(row.high),
                low: Number(row.low),
                volume: Number(row.volume),
            })),
        });
    }
    catch (error) {
        console.error("Get historical prices error:", error);
        res.status(500).json({ error: error.message || "Failed to get historical prices" });
    }
});
// Get all available stock symbols
router.get("/symbols", auth_1.ensureAuthenticated, async (req, res) => {
    try {
        const result = await pool_1.pool.query(`SELECT DISTINCT stock_symbol 
       FROM public.equity_prices 
       ORDER BY stock_symbol ASC`);
        res.json({
            symbols: result.rows.map((row) => row.stock_symbol),
        });
    }
    catch (error) {
        console.error("Get symbols error:", error);
        res.status(500).json({ error: error.message || "Failed to get symbols" });
    }
});
// Get current price for a symbol (for display when selecting)
router.get("/price/:symbol", auth_1.ensureAuthenticated, async (req, res) => {
    try {
        const { symbol } = req.params;
        const { mode } = req.query;
        const simMode = (mode === 'realtime' ? 'realtime' : 'historical');
        if (simMode === 'realtime') {
            // For real-time, use Finnhub
            const quote = await (0, finnhub_1.getQuote)(symbol);
            if (quote && quote.c > 0) {
                return res.json({ price: quote.c, date: new Date().toISOString().split('T')[0] });
            }
            return res.status(404).json({ error: `Unable to fetch real-time price for ${symbol}` });
        }
        else {
            // For historical, get price at current simulation date
            const user = req.user;
            const userId = user.id;
            const simId = await getOrCreateSimulation(userId, 'historical');
            const sim = await pool_1.pool.query(`SELECT "current_date" FROM simulations WHERE id = $1`, [simId]);
            const currentDateRaw = sim.rows[0]?.current_date;
            const currentDate = currentDateRaw
                ? (typeof currentDateRaw === 'string' ? currentDateRaw : new Date(currentDateRaw).toISOString().split('T')[0])
                : null;
            if (!currentDate) {
                return res.status(400).json({ error: "Simulation date not set" });
            }
            const price = await getHistoricalPrice(symbol, currentDate);
            if (price) {
                return res.json({ price, date: currentDate });
            }
            // If no price at current date, get earliest available
            const earliestResult = await pool_1.pool.query(`SELECT close, price_date FROM public.equity_prices
         WHERE stock_symbol = $1
         ORDER BY price_date ASC
         LIMIT 1`, [symbol]);
            if (earliestResult.rows.length > 0) {
                return res.json({
                    price: Number(earliestResult.rows[0].close),
                    date: earliestResult.rows[0].price_date,
                    note: `Earliest available date. Current simulation date: ${currentDate}`
                });
            }
            return res.status(404).json({ error: `No price data available for ${symbol}` });
        }
    }
    catch (error) {
        console.error("Get price error:", error);
        res.status(500).json({ error: error.message || "Failed to get price" });
    }
});
// Get real-time quote
router.get("/realtime/:symbol", auth_1.ensureAuthenticated, async (req, res) => {
    try {
        const { symbol } = req.params;
        const quote = await (0, finnhub_1.getQuote)(symbol);
        if (!quote || !quote.c || quote.c <= 0) {
            return res.status(404).json({
                error: `Unable to fetch real-time quote for ${symbol}. This symbol may not be available on Finnhub. Try using Historical Simulation mode instead.`
            });
        }
        res.json({
            symbol,
            price: quote.c,
            open: quote.o,
            high: quote.h,
            low: quote.l,
            previousClose: quote.pc,
            change: quote.c - quote.pc,
            changePercent: ((quote.c - quote.pc) / quote.pc) * 100,
            timestamp: quote.t,
        });
    }
    catch (error) {
        console.error("Get real-time quote error:", error);
        res.status(500).json({
            error: error.message || `Failed to get real-time quote for ${req.params.symbol}. Try using Historical Simulation mode instead.`
        });
    }
});
exports.default = router;
