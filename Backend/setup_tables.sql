-- ============================================
-- ZENITH Safe Folio - Database Schema
-- ============================================

-- 1. Historical Equity Prices (from merged_all.csv)
-- Columns: stock_symbol, price_date, open, high, low, close, volume
CREATE TABLE IF NOT EXISTS public.equity_prices (
  stock_symbol  text        NOT NULL,
  price_date    date        NOT NULL,
  open          numeric(18,4),
  high          numeric(18,4),
  low           numeric(18,4),
  close         numeric(18,4),
  volume        bigint,
  PRIMARY KEY (stock_symbol, price_date)
);

CREATE INDEX IF NOT EXISTS idx_equity_symbol_date ON public.equity_prices (stock_symbol, price_date);
CREATE INDEX IF NOT EXISTS idx_equity_date ON public.equity_prices (price_date);

-- 2. Mutual Fund NAV History (from mutual_fund_nav_history.csv)
-- Columns: Date, NAV, Scheme_Code
CREATE TABLE IF NOT EXISTS market.mf_nav_history_raw (
  "Date"        text,
  "NAV"         text,
  "Scheme_Code" text
);

CREATE TABLE IF NOT EXISTS market.mf_nav_history (
  scheme_code   text        NOT NULL,
  nav_ts        timestamp   NOT NULL,
  nav           numeric(18,6) NOT NULL,
  nav_date      date        GENERATED ALWAYS AS (nav_ts::date) STORED,
  PRIMARY KEY (scheme_code, nav_date)
);

CREATE INDEX IF NOT EXISTS idx_mf_scheme_date ON market.mf_nav_history (scheme_code, nav_date);

-- 3. Users (practice capital)
CREATE TABLE IF NOT EXISTS users (
  id          serial PRIMARY KEY,
  google_id   text UNIQUE NOT NULL,
  email       text UNIQUE,
  name        text,
  picture     text,
  balance     numeric(18,2) NOT NULL DEFAULT 100000,
  created_at  timestamp DEFAULT now(),
  updated_at  timestamp DEFAULT now()
);

-- 4. Simulation State (tracks current date for historical mode)
CREATE TABLE IF NOT EXISTS simulations (
  id            serial PRIMARY KEY,
  user_id       int NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          text NOT NULL,
  current_date  date NOT NULL,
  start_date    date NOT NULL,
  end_date      date NOT NULL,
  created_at    timestamp DEFAULT now(),
  updated_at    timestamp DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_sim_user ON simulations (user_id);

-- 5. Positions (open holdings)
CREATE TABLE IF NOT EXISTS positions (
  id            serial PRIMARY KEY,
  user_id       int NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  simulation_id int REFERENCES simulations(id) ON DELETE CASCADE,
  symbol        text NOT NULL,
  quantity      numeric(18,4) NOT NULL DEFAULT 0,
  average_price numeric(18,4) NOT NULL DEFAULT 0,
  updated_at    timestamp DEFAULT now(),
  UNIQUE (user_id, simulation_id, symbol)
);

CREATE INDEX IF NOT EXISTS idx_pos_user_sim ON positions (user_id, simulation_id);

-- 6. Transactions (trade history)
CREATE TABLE IF NOT EXISTS transactions (
  id            serial PRIMARY KEY,
  user_id       int NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  simulation_id int REFERENCES simulations(id) ON DELETE CASCADE,
  symbol        text NOT NULL,
  side          text NOT NULL CHECK (side IN ('BUY','SELL')),
  quantity      numeric(18,4) NOT NULL,
  price         numeric(18,4) NOT NULL,
  executed_at   timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_txn_user ON transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_txn_sim ON transactions (simulation_id);
CREATE INDEX IF NOT EXISTS idx_txn_executed ON transactions (executed_at DESC);

-- 7. Real-time Price Cache (for Finnhub API)
CREATE TABLE IF NOT EXISTS realtime_prices (
  symbol        text PRIMARY KEY,
  price         numeric(18,4),
  change        numeric(18,4),
  change_percent numeric(18,4),
  high          numeric(18,4),
  low           numeric(18,4),
  volume        bigint,
  last_updated  timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_realtime_updated ON realtime_prices (last_updated);

-- 8. Watchlist (user's stock watchlist)
CREATE TABLE IF NOT EXISTS watchlist (
  id            serial PRIMARY KEY,
  user_id       int NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol        text NOT NULL,
  created_at    timestamp DEFAULT now(),
  UNIQUE (user_id, symbol)
);

CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist (user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_symbol ON watchlist (symbol);

-- ============================================
-- Import Commands (run these after creating tables)
-- ============================================

-- Import equity prices (adjust path as needed)
-- \copy public.equity_prices (stock_symbol, price_date, open, high, low, close, volume)
-- FROM '/Users/aryan/Documents/PROJECTS/Zenith/Backend/merged_all.csv' WITH (FORMAT csv, HEADER true);

-- Import mutual fund NAV (if you have the file)
-- \copy market.mf_nav_history_raw ("Date","NAV","Scheme_Code")
-- FROM '/Users/aryan/Documents/PROJECTS/Zenith/Backend/mutual_fund_nav_history.csv' WITH (FORMAT csv, HEADER true);

-- Then normalize MF data:
-- INSERT INTO market.mf_nav_history (scheme_code, nav_ts, nav)
-- SELECT
--   "Scheme_Code",
--   to_timestamp("Date", 'YYYY-MM-DD HH24:MI:SS.US'),
--   NULLIF("NAV", '')::numeric
-- FROM market.mf_nav_history_raw
-- ON CONFLICT (scheme_code, nav_date) DO NOTHING;
