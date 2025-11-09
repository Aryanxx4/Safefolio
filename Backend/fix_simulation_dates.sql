-- ============================================
-- Fix Simulation Dates to Match Your Data
-- ============================================
-- This script updates all simulations to use the actual date range
-- from your equity_prices table

-- Step 1: Check your actual data range
SELECT 
  MIN(price_date) as earliest_date,
  MAX(price_date) as latest_date,
  COUNT(DISTINCT stock_symbol) as unique_symbols,
  COUNT(*) as total_records
FROM public.equity_prices;

-- Step 2: Update all simulations to use the correct date range
-- This sets current_date, start_date, and end_date to match your actual data
UPDATE simulations
SET 
  start_date = (SELECT MIN(price_date) FROM public.equity_prices),
  "current_date" = (SELECT MIN(price_date) FROM public.equity_prices),
  end_date = (SELECT MAX(price_date) FROM public.equity_prices),
  updated_at = NOW()
WHERE name = 'default';

-- Step 3: Verify the update
SELECT 
  id,
  user_id,
  name,
  "current_date",
  start_date,
  end_date
FROM simulations
WHERE name = 'default'
ORDER BY id;

-- Step 4: Check which symbols have data on the start date
-- This helps you know which symbols you can trade immediately
SELECT 
  stock_symbol,
  price_date,
  close
FROM public.equity_prices
WHERE price_date = (SELECT MIN(price_date) FROM public.equity_prices)
ORDER BY stock_symbol
LIMIT 20;

