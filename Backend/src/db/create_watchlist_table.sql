-- Create watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
  id            serial PRIMARY KEY,
  user_id       int NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol        text NOT NULL,
  created_at    timestamp DEFAULT now(),
  UNIQUE (user_id, symbol)
);

CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist (user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_symbol ON watchlist (symbol);

