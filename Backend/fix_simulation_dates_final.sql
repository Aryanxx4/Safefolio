-- ============================================
-- Fix All Simulation Dates to Match Actual Data
-- ============================================
-- This script updates ALL simulations to use the correct date range
-- from your equity_prices table

-- Step 1: Check your actual data range
SELECT 
  MIN(price_date) as earliest_date,
  MAX(price_date) as latest_date,
  COUNT(DISTINCT stock_symbol) as unique_symbols,
  COUNT(*) as total_records
FROM public.equity_prices;

-- Step 2: Update ALL historical simulations to use the correct date range
UPDATE simulations
SET 
  start_date = (SELECT MIN(price_date) FROM public.equity_prices),
  "current_date" = (SELECT MIN(price_date) FROM public.equity_prices),
  end_date = (SELECT MAX(price_date) FROM public.equity_prices),
  updated_at = NOW()
WHERE name = 'historical' OR name = 'default';

-- Step 3: Verify the update
SELECT 
  id,
  user_id,
  name,
  "current_date",
  start_date,
  end_date
FROM simulations
WHERE name IN ('historical', 'default', 'realtime')
ORDER BY user_id, name;

-- Step 4: Check which symbols have data on the start date
SELECT 
  stock_symbol,
  price_date,
  close
FROM public.equity_prices
WHERE price_date = (SELECT MIN(price_date) FROM public.equity_prices)
ORDER BY stock_symbol
LIMIT 20;

