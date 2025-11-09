-- Insert test data for dashboard charts
WITH user_data AS (
  SELECT id FROM users WHERE google_id = 'test_user_1'
)
INSERT INTO transactions (user_id, symbol, side, quantity, price, executed_at)
SELECT 
  id,
  'HDFCBANK',
  'BUY',
  100,
  1500.00,
  NOW() - INTERVAL '1 day'
FROM user_data
WHERE EXISTS (SELECT 1 FROM user_data);

-- Create a position
WITH user_data AS (
  SELECT id FROM users WHERE google_id = 'test_user_1'
)
INSERT INTO positions (user_id, symbol, quantity, average_price)
SELECT 
  id,
  'HDFCBANK',
  100,
  1500.00
FROM user_data
WHERE EXISTS (SELECT 1 FROM user_data);

-- Add another transaction
WITH user_data AS (
  SELECT id FROM users WHERE google_id = 'test_user_1'
)
INSERT INTO transactions (user_id, symbol, side, quantity, price, executed_at)
SELECT 
  id,
  'INFY',
  'BUY',
  50,
  1800.00,
  NOW()
FROM user_data
WHERE EXISTS (SELECT 1 FROM user_data);

-- Create another position
WITH user_data AS (
  SELECT id FROM users WHERE google_id = 'test_user_1'
)
INSERT INTO positions (user_id, symbol, quantity, average_price)
SELECT 
  id,
  'INFY',
  50,
  1800.00
FROM user_data
WHERE EXISTS (SELECT 1 FROM user_data);