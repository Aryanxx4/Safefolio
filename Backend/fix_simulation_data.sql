-- ============================================
-- Fix Simulation Data for Existing Users
-- ============================================
-- This script ensures all users have simulation records
-- Run this in pgAdmin after importing equity_prices data

-- Step 1: Ensure all tables exist (run setup_tables.sql first if not done)
-- The tables should already exist from setup_tables.sql

-- Step 2: Create default simulation for ALL existing users who don't have one
-- This is the key fix - every user needs a simulation record
INSERT INTO simulations (user_id, name, current_date, start_date, end_date)
SELECT 
  u.id,
  'default',
  '2007-01-01'::date,  -- Start date (adjust based on your equity_prices data range)
  '2007-01-01'::date,  -- Start date
  '2012-12-31'::date   -- End date (adjust based on your equity_prices data range)
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM simulations s 
  WHERE s.user_id = u.id 
  AND s.name = 'default'
);

-- Step 3: Verify the data
-- Check how many users have simulations
SELECT 
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT s.user_id) as users_with_simulations
FROM users u
LEFT JOIN simulations s ON u.id = s.user_id AND s.name = 'default';

-- Step 4: Check date range of your equity_prices data
-- This helps you set the correct start_date and end_date above
SELECT 
  MIN(price_date) as earliest_date,
  MAX(price_date) as latest_date,
  COUNT(DISTINCT stock_symbol) as unique_symbols,
  COUNT(*) as total_records
FROM public.equity_prices;

-- Step 5: Update simulation dates to match your actual data range (optional)
-- Uncomment and adjust dates based on Step 4 results:
/*
UPDATE simulations
SET 
  start_date = (SELECT MIN(price_date) FROM public.equity_prices),
  current_date = (SELECT MIN(price_date) FROM public.equity_prices),
  end_date = (SELECT MAX(price_date) FROM public.equity_prices)
WHERE name = 'default';
*/

-- ============================================
-- Additional Data You May Need
-- ============================================

-- Note: You DON'T need to import data into these tables for basic trading to work:
-- - positions: Created automatically when you buy stocks
-- - transactions: Created automatically when you place orders
-- - realtime_prices: Only needed for live trading (optional)
-- - mf_nav_history: Only for mutual funds (optional)

-- However, you DO need:
-- ✅ equity_prices: Already imported (you mentioned this)
-- ✅ users: Created automatically via OAuth login
-- ✅ simulations: Created by the script above (this fixes your error!)

