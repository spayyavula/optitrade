/*
  # Seed Initial Data

  1. Data Sources
    - Polygon.io (real-time)
    - Mock service (simulated)
    - Manual entry

  2. Sample Stocks
    - Popular stocks for demo

  3. Market Sessions
    - Current week's market sessions
*/

-- Insert data sources
INSERT INTO data_sources (name, type, description, is_real_time, is_mock, api_endpoint) VALUES
  ('polygon_io', 'polygon_io', 'Polygon.io real-time market data API', true, false, 'https://api.polygon.io'),
  ('mock_service', 'mock', 'Simulated market data for demonstration', false, true, null),
  ('simulated_realtime', 'simulated', 'Real-time simulated data when market is closed', true, true, null),
  ('manual_entry', 'manual', 'Manually entered data', false, false, null)
ON CONFLICT (name) DO NOTHING;

-- Insert popular stocks
INSERT INTO stocks (symbol, name, exchange, sector) VALUES
  ('AAPL', 'Apple Inc.', 'NASDAQ', 'Technology'),
  ('MSFT', 'Microsoft Corporation', 'NASDAQ', 'Technology'),
  ('GOOGL', 'Alphabet Inc.', 'NASDAQ', 'Technology'),
  ('AMZN', 'Amazon.com Inc.', 'NASDAQ', 'Consumer Discretionary'),
  ('TSLA', 'Tesla Inc.', 'NASDAQ', 'Consumer Discretionary'),
  ('META', 'Meta Platforms Inc.', 'NASDAQ', 'Technology'),
  ('NFLX', 'Netflix Inc.', 'NASDAQ', 'Communication Services'),
  ('NVDA', 'NVIDIA Corporation', 'NASDAQ', 'Technology'),
  ('SPY', 'SPDR S&P 500 ETF Trust', 'NYSE', 'ETF'),
  ('QQQ', 'Invesco QQQ Trust', 'NASDAQ', 'ETF')
ON CONFLICT (symbol) DO NOTHING;

-- Insert current week's market sessions (example for this week)
DO $$
DECLARE
  current_week_start date := date_trunc('week', CURRENT_DATE)::date;
  day_offset integer;
BEGIN
  -- Generate market sessions for current week (Monday to Friday)
  FOR day_offset IN 0..4 LOOP
    DECLARE
      session_date date := current_week_start + day_offset;
      session_start timestamptz;
      session_end timestamptz;
    BEGIN
      -- Pre-market session (4:00 AM - 9:30 AM ET)
      session_start := (session_date || ' 04:00:00-05')::timestamptz;
      session_end := (session_date || ' 09:30:00-05')::timestamptz;
      
      INSERT INTO market_sessions (session_date, session_type, start_time, end_time, is_trading_day)
      VALUES (session_date, 'pre_market', session_start, session_end, true)
      ON CONFLICT (session_date, session_type) DO NOTHING;
      
      -- Regular session (9:30 AM - 4:00 PM ET)
      session_start := (session_date || ' 09:30:00-05')::timestamptz;
      session_end := (session_date || ' 16:00:00-05')::timestamptz;
      
      INSERT INTO market_sessions (session_date, session_type, start_time, end_time, is_trading_day)
      VALUES (session_date, 'regular', session_start, session_end, true)
      ON CONFLICT (session_date, session_type) DO NOTHING;
      
      -- After-hours session (4:00 PM - 8:00 PM ET)
      session_start := (session_date || ' 16:00:00-05')::timestamptz;
      session_end := (session_date || ' 20:00:00-05')::timestamptz;
      
      INSERT INTO market_sessions (session_date, session_type, start_time, end_time, is_trading_day)
      VALUES (session_date, 'after_hours', session_start, session_end, true)
      ON CONFLICT (session_date, session_type) DO NOTHING;
    END;
  END LOOP;
  
  -- Weekend sessions (market closed)
  FOR day_offset IN 5..6 LOOP
    DECLARE
      session_date date := current_week_start + day_offset;
    BEGIN
      INSERT INTO market_sessions (session_date, session_type, start_time, end_time, is_trading_day, notes)
      VALUES (
        session_date, 
        'closed', 
        (session_date || ' 00:00:00-05')::timestamptz,
        (session_date || ' 23:59:59-05')::timestamptz,
        false,
        'Weekend - Market Closed'
      )
      ON CONFLICT (session_date, session_type) DO NOTHING;
    END;
  END LOOP;
END $$;

-- Insert some sample options contracts for AAPL
DO $$
DECLARE
  aapl_stock_id uuid;
  expiry_date date;
  strike_price decimal;
BEGIN
  -- Get AAPL stock ID
  SELECT id INTO aapl_stock_id FROM stocks WHERE symbol = 'AAPL';
  
  -- Generate options for next Friday
  expiry_date := date_trunc('week', CURRENT_DATE + interval '7 days')::date + 4; -- Next Friday
  
  -- Generate call and put options for strikes around $175
  FOR strike_price IN 165..185 BY 5 LOOP
    -- Call option
    INSERT INTO options_contracts (
      underlying_stock_id, 
      contract_symbol, 
      underlying_symbol, 
      option_type, 
      strike_price, 
      expiration_date
    ) VALUES (
      aapl_stock_id,
      'AAPL' || to_char(expiry_date, 'YYMMDD') || 'C' || lpad((strike_price * 1000)::text, 8, '0'),
      'AAPL',
      'call',
      strike_price,
      expiry_date
    ) ON CONFLICT (contract_symbol) DO NOTHING;
    
    -- Put option
    INSERT INTO options_contracts (
      underlying_stock_id, 
      contract_symbol, 
      underlying_symbol, 
      option_type, 
      strike_price, 
      expiration_date
    ) VALUES (
      aapl_stock_id,
      'AAPL' || to_char(expiry_date, 'YYMMDD') || 'P' || lpad((strike_price * 1000)::text, 8, '0'),
      'AAPL',
      'put',
      strike_price,
      expiry_date
    ) ON CONFLICT (contract_symbol) DO NOTHING;
  END LOOP;
END $$;

-- Insert initial data quality metrics
INSERT INTO data_quality_metrics (
  data_source_id, 
  total_requests, 
  successful_requests, 
  failed_requests,
  uptime_percentage,
  mock_data_percentage,
  connection_status
)
SELECT 
  ds.id,
  0,
  0,
  0,
  100.0,
  CASE WHEN ds.is_mock THEN 100.0 ELSE 0.0 END,
  CASE WHEN ds.is_mock THEN 'simulated'::connection_status ELSE 'disconnected'::connection_status END
FROM data_sources ds
ON CONFLICT (data_source_id, metric_date) DO NOTHING;