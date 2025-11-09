# Zenith Safe Folio - Setup Instructions

## 1. Database Setup (PostgreSQL)

### Run these SQL commands in pgAdmin or psql:

```sql
-- Run all commands from setup_tables.sql
-- Tables will be created in the public schema
-- (See setup_tables.sql file for complete schema)
```

### Import CSV Data:

**Option A: Using psql (from terminal)**
```bash
psql -U postgres -d ZENITH -c "\copy public.equity_prices (stock_symbol, price_date, open, high, low, close, volume) FROM '/Users/aryan/Documents/PROJECTS/Zenith/Backend/merged_all.csv' WITH (FORMAT csv, HEADER true);"
```

**Option B: Using pgAdmin**
1. Right-click on `public.equity_prices` table (or just `equity_prices` in the public schema)
2. Select "Import/Export Data"
3. Choose your CSV file
4. Map columns: stock_symbol, price_date, open, high, low, close, volume
5. Enable "Header" option
6. Click "OK"

## 2. Backend Setup

```bash
cd "/Users/aryan/Documents/PROJECTS/Zenith/Backend"
npm install
npm run dev
```

Backend will run on `http://localhost:4000`

## 3. Frontend Setup

```bash
cd "/Users/aryan/Documents/PROJECTS/Zenith/Frontend"
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

## 4. Features Now Working

✅ **Buy/Sell Orders** - Place orders in historical or real-time mode
✅ **Advance Time** - Move simulation forward by 1 week, 1 month, 3 months, or 1 year
✅ **Historical Prices** - Charts show price history up to current simulation date
✅ **Real-Time Quotes** - Live prices from Finnhub API (updates every 5 seconds)
✅ **Portfolio Tracking** - Dashboard shows cash, positions, and P&L
✅ **Transaction History** - All trades are recorded and displayed

## 5. Available Stock Symbols

Your CSV contains data for these companies:
MUNDRAPORT, ADANIPORTS, ASIANPAINT, UTIBANK, AXISBANK, BAJAJ-AUTO, BAJAJFINSV, BAJAUTOFIN, BAJFINANCE, BHARTI, BHARTIARTL, BPCL, BRITANNIA, CIPLA, COALINDIA, DRREDDY, EICHERMOT, GAIL, GRASIM, HCLTECH, HDFC, HDFCBANK, HEROHONDA, HEROMOTOCO, HINDALC0, HINDALCO, HINDLEVER, HINDUNILVR, ICICIBANK, INDUSINDBK, INFOSYSTCH, INFY, IOC, ITC, JSWSTL, JSWSTEEL, KOTAKMAH, KOTAKBANK, LT, MARUTI, M&M, NESTLEIND, NTPC, ONGC, POWERGRID, RELIANCE, SBIN, SHREECEM, SUNPHARMA, TELCO, TATAMOTORS, TISCO, TATASTEEL, TCS, TECHM, TITAN, ULTRACEMCO, UNIPHOS, UPL, SESAGOA, SSLT, VEDL, WIPRO, ZEETELE, ZEEL, INFRATEL

## 6. API Endpoints

- `POST /trading/order` - Place buy/sell order
- `POST /trading/advance` - Advance simulation time
- `GET /trading/simulation` - Get current simulation state
- `GET /trading/historical/:symbol` - Get historical price data
- `GET /trading/realtime/:symbol` - Get real-time quote from Finnhub
- `GET /portfolio/summary` - Get portfolio summary
- `GET /auth/me` - Check authentication status

## 7. Troubleshooting

**If orders fail:**
- Ensure PostgreSQL is running
- Check that tables are created (run setup_tables.sql)
- Verify CSV data is imported
- Check backend console for errors

**If real-time quotes fail:**
- Verify Finnhub API key is in Backend/.env
- Check internet connection
- Some symbols may not be available on Finnhub (use historical mode instead)
