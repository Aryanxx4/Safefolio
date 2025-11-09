-- Insert a test user (if doesn't exist)
INSERT INTO users (google_id, email, name, balance)
VALUES ('test_user_1', 'test@example.com', 'Test User', 100000)
ON CONFLICT (google_id) DO NOTHING;

-- Create a default simulation for the test user
WITH user_id AS (
  SELECT id FROM users WHERE google_id = 'test_user_1'
)
INSERT INTO simulations (user_id, name, current_date, start_date, end_date)
SELECT 
  id,
  'default',
  '2007-01-02'::date,
  '2007-01-02'::date,
  '2012-12-31'::date
FROM user_id
WHERE NOT EXISTS (
  SELECT 1 FROM simulations s 
  JOIN user_id u ON s.user_id = u.id 
  WHERE s.name = 'default'
);

-- Create an empty position record if needed
WITH user_id AS (
  SELECT id FROM users WHERE google_id = 'test_user_1'
),
sim_id AS (
  SELECT s.id 
  FROM simulations s 
  JOIN user_id u ON s.user_id = u.id 
  WHERE s.name = 'default'
)
INSERT INTO positions (user_id, simulation_id, symbol, quantity, average_price)
SELECT 
  u.id,
  s.id,
  'HDFCBANK',
  0,
  0
FROM user_id u
CROSS JOIN sim_id s
WHERE NOT EXISTS (
  SELECT 1 FROM positions p 
  WHERE p.user_id = u.id 
  AND p.simulation_id = s.id 
  AND p.symbol = 'HDFCBANK'
);