/*
  # Market Data Database Schema

  1. New Tables
    - `data_sources` - Track different data sources (Polygon.io, mock, etc.)
    - `stocks` - Store stock information and current prices
    - `stock_quotes` - Real-time and historical stock quotes
    - `options_contracts` - Options contract definitions
    - `options_quotes` - Real-time and historical options quotes
    - `market_data_bars` - OHLCV candlestick data
    - `user_watchlists` - User watchlist items
    - `user_positions` - User portfolio positions
    - `trading_strategies` - Saved trading strategies
    - `strategy_legs` - Individual legs of trading strategies
    - `market_sessions` - Track market hours and sessions
    - `data_quality_metrics` - Track data quality and source reliability

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for public market data access

  3. Features
    - Clear distinction between real and mock data
    - Data source tracking and quality metrics
    - Comprehensive options data storage
    - User portfolio and strategy management
    - Market session tracking
*/

-- Create enum types for better data integrity
CREATE TYPE data_source_type AS ENUM ('polygon_io', 'mock', 'simulated', 'manual', 'other');
CREATE TYPE market_session_type AS ENUM ('pre_market', 'regular', 'after_hours', 'closed');
CREATE TYPE option_type AS ENUM ('call', 'put');
CREATE TYPE position_type AS ENUM ('stock', 'call', 'put');
CREATE TYPE strategy_action AS ENUM ('buy', 'sell');
CREATE TYPE connection_status AS ENUM ('connected', 'disconnected', 'simulated', 'error');

-- Data Sources table - track where data comes from
CREATE TABLE IF NOT EXISTS data_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  type data_source_type NOT NULL,
  description text,
  is_real_time boolean DEFAULT false,
  is_mock boolean DEFAULT false,
  api_endpoint text,
  reliability_score decimal(3,2) DEFAULT 1.00, -- 0.00 to 1.00
  last_successful_connection timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Stocks table - basic stock information
CREATE TABLE IF NOT EXISTS stocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL UNIQUE,
  name text NOT NULL,
  exchange text DEFAULT 'NASDAQ',
  sector text,
  industry text,
  market_cap bigint,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Stock Quotes table - real-time and historical quotes
CREATE TABLE IF NOT EXISTS stock_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id uuid NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  data_source_id uuid NOT NULL REFERENCES data_sources(id),
  symbol text NOT NULL, -- Denormalized for faster queries
  bid decimal(10,4),
  ask decimal(10,4),
  last_price decimal(10,4) NOT NULL,
  volume bigint DEFAULT 0,
  change_amount decimal(10,4),
  change_percent decimal(8,4),
  is_mock boolean DEFAULT false,
  is_real_time boolean DEFAULT false,
  market_session market_session_type DEFAULT 'regular',
  quote_timestamp timestamptz NOT NULL,
  received_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Market Data Bars table - OHLCV data
CREATE TABLE IF NOT EXISTS market_data_bars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id uuid NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  data_source_id uuid NOT NULL REFERENCES data_sources(id),
  symbol text NOT NULL,
  timeframe text NOT NULL, -- '1min', '5min', '1hour', '1day', etc.
  open_price decimal(10,4) NOT NULL,
  high_price decimal(10,4) NOT NULL,
  low_price decimal(10,4) NOT NULL,
  close_price decimal(10,4) NOT NULL,
  volume bigint NOT NULL DEFAULT 0,
  vwap decimal(10,4), -- Volume Weighted Average Price
  is_mock boolean DEFAULT false,
  bar_timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(stock_id, timeframe, bar_timestamp, data_source_id)
);

-- Options Contracts table
CREATE TABLE IF NOT EXISTS options_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  underlying_stock_id uuid NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  contract_symbol text NOT NULL UNIQUE,
  underlying_symbol text NOT NULL,
  option_type option_type NOT NULL,
  strike_price decimal(10,4) NOT NULL,
  expiration_date date NOT NULL,
  days_to_expiry integer GENERATED ALWAYS AS (expiration_date - CURRENT_DATE) STORED,
  multiplier integer DEFAULT 100,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Options Quotes table
CREATE TABLE IF NOT EXISTS options_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES options_contracts(id) ON DELETE CASCADE,
  data_source_id uuid NOT NULL REFERENCES data_sources(id),
  contract_symbol text NOT NULL,
  bid decimal(10,4),
  ask decimal(10,4),
  last_price decimal(10,4) NOT NULL,
  volume integer DEFAULT 0,
  open_interest integer DEFAULT 0,
  implied_volatility decimal(8,6),
  delta decimal(8,6),
  gamma decimal(8,6),
  theta decimal(8,6),
  vega decimal(8,6),
  rho decimal(8,6),
  is_mock boolean DEFAULT false,
  is_real_time boolean DEFAULT false,
  market_session market_session_type DEFAULT 'regular',
  quote_timestamp timestamptz NOT NULL,
  received_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- User Watchlists table
CREATE TABLE IF NOT EXISTS user_watchlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL, -- References auth.users
  stock_id uuid NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  notes text,
  alert_price_above decimal(10,4),
  alert_price_below decimal(10,4),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, stock_id)
);

-- User Positions table
CREATE TABLE IF NOT EXISTS user_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL, -- References auth.users
  symbol text NOT NULL,
  position_type position_type NOT NULL,
  quantity integer NOT NULL,
  average_price decimal(10,4) NOT NULL,
  current_price decimal(10,4),
  strike_price decimal(10,4), -- For options
  expiration_date date, -- For options
  profit_loss decimal(12,4),
  profit_loss_percent decimal(8,4),
  is_simulated boolean DEFAULT true, -- All positions are simulated in this educational platform
  opened_at timestamptz DEFAULT now(),
  closed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trading Strategies table
CREATE TABLE IF NOT EXISTS trading_strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL, -- References auth.users
  name text NOT NULL,
  description text,
  strategy_type text, -- 'bullish', 'bearish', 'neutral', etc.
  regime text, -- 'short-term', 'medium-term', 'long-term'
  market_condition text, -- 'bullish', 'bearish', 'neutral', 'volatile'
  max_profit decimal(12,4),
  max_loss decimal(12,4),
  break_even_points decimal(10,4)[],
  is_template boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Strategy Legs table
CREATE TABLE IF NOT EXISTS strategy_legs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id uuid NOT NULL REFERENCES trading_strategies(id) ON DELETE CASCADE,
  leg_order integer NOT NULL,
  option_type option_type NOT NULL,
  action strategy_action NOT NULL,
  strike_price decimal(10,4) NOT NULL,
  expiration_date date NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  price decimal(10,4) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Market Sessions table - track market hours and status
CREATE TABLE IF NOT EXISTS market_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date date NOT NULL,
  session_type market_session_type NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  is_trading_day boolean DEFAULT true,
  notes text, -- For holidays, early closes, etc.
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_date, session_type)
);

-- Data Quality Metrics table
CREATE TABLE IF NOT EXISTS data_quality_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_source_id uuid NOT NULL REFERENCES data_sources(id),
  metric_date date NOT NULL DEFAULT CURRENT_DATE,
  total_requests integer DEFAULT 0,
  successful_requests integer DEFAULT 0,
  failed_requests integer DEFAULT 0,
  average_response_time_ms integer,
  uptime_percentage decimal(5,2),
  mock_data_percentage decimal(5,2), -- Percentage of data that was mocked
  last_connection_attempt timestamptz,
  connection_status connection_status,
  error_details jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(data_source_id, metric_date)
);

-- Enable Row Level Security
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_data_bars ENABLE ROW LEVEL SECURITY;
ALTER TABLE options_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE options_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_legs ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_quality_metrics ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stock_quotes_symbol_timestamp ON stock_quotes(symbol, quote_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_stock_quotes_data_source ON stock_quotes(data_source_id);
CREATE INDEX IF NOT EXISTS idx_stock_quotes_is_mock ON stock_quotes(is_mock);
CREATE INDEX IF NOT EXISTS idx_stock_quotes_is_real_time ON stock_quotes(is_real_time);

CREATE INDEX IF NOT EXISTS idx_market_data_bars_symbol_timeframe ON market_data_bars(symbol, timeframe, bar_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_market_data_bars_is_mock ON market_data_bars(is_mock);

CREATE INDEX IF NOT EXISTS idx_options_quotes_contract_timestamp ON options_quotes(contract_id, quote_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_options_quotes_symbol ON options_quotes(contract_symbol);
CREATE INDEX IF NOT EXISTS idx_options_quotes_is_mock ON options_quotes(is_mock);

CREATE INDEX IF NOT EXISTS idx_options_contracts_underlying ON options_contracts(underlying_symbol, expiration_date);
CREATE INDEX IF NOT EXISTS idx_options_contracts_expiry ON options_contracts(expiration_date) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_user_watchlists_user ON user_watchlists(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_positions_user ON user_positions(user_id) WHERE closed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_trading_strategies_user ON trading_strategies(user_id) WHERE is_active = true;

-- RLS Policies

-- Data sources - public read access
CREATE POLICY "Public read access to data sources"
  ON data_sources
  FOR SELECT
  TO public
  USING (true);

-- Stocks - public read access
CREATE POLICY "Public read access to stocks"
  ON stocks
  FOR SELECT
  TO public
  USING (true);

-- Stock quotes - public read access
CREATE POLICY "Public read access to stock quotes"
  ON stock_quotes
  FOR SELECT
  TO public
  USING (true);

-- Market data bars - public read access
CREATE POLICY "Public read access to market data bars"
  ON market_data_bars
  FOR SELECT
  TO public
  USING (true);

-- Options contracts - public read access
CREATE POLICY "Public read access to options contracts"
  ON options_contracts
  FOR SELECT
  TO public
  USING (true);

-- Options quotes - public read access
CREATE POLICY "Public read access to options quotes"
  ON options_quotes
  FOR SELECT
  TO public
  USING (true);

-- Market sessions - public read access
CREATE POLICY "Public read access to market sessions"
  ON market_sessions
  FOR SELECT
  TO public
  USING (true);

-- User watchlists - users can only access their own
CREATE POLICY "Users can manage their own watchlists"
  ON user_watchlists
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User positions - users can only access their own
CREATE POLICY "Users can manage their own positions"
  ON user_positions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trading strategies - users can access their own and public templates
CREATE POLICY "Users can access their own strategies and templates"
  ON trading_strategies
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_template = true);

CREATE POLICY "Users can manage their own strategies"
  ON trading_strategies
  FOR INSERT, UPDATE, DELETE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Strategy legs - access through parent strategy
CREATE POLICY "Users can access strategy legs through parent strategy"
  ON strategy_legs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trading_strategies ts 
      WHERE ts.id = strategy_legs.strategy_id 
      AND (ts.user_id = auth.uid() OR ts.is_template = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trading_strategies ts 
      WHERE ts.id = strategy_legs.strategy_id 
      AND ts.user_id = auth.uid()
    )
  );

-- Data quality metrics - admin access only (for now, public read)
CREATE POLICY "Public read access to data quality metrics"
  ON data_quality_metrics
  FOR SELECT
  TO public
  USING (true);

-- Functions for data management

-- Function to update stock quote with data source tracking
CREATE OR REPLACE FUNCTION update_stock_quote(
  p_symbol text,
  p_bid decimal,
  p_ask decimal,
  p_last_price decimal,
  p_volume bigint,
  p_data_source_name text,
  p_is_mock boolean DEFAULT false,
  p_is_real_time boolean DEFAULT true
) RETURNS uuid AS $$
DECLARE
  v_stock_id uuid;
  v_data_source_id uuid;
  v_quote_id uuid;
BEGIN
  -- Get or create stock
  INSERT INTO stocks (symbol, name) 
  VALUES (p_symbol, p_symbol || ' Corporation')
  ON CONFLICT (symbol) DO NOTHING;
  
  SELECT id INTO v_stock_id FROM stocks WHERE symbol = p_symbol;
  
  -- Get data source
  SELECT id INTO v_data_source_id FROM data_sources WHERE name = p_data_source_name;
  
  -- Insert quote
  INSERT INTO stock_quotes (
    stock_id, data_source_id, symbol, bid, ask, last_price, volume,
    is_mock, is_real_time, quote_timestamp
  ) VALUES (
    v_stock_id, v_data_source_id, p_symbol, p_bid, p_ask, p_last_price, p_volume,
    p_is_mock, p_is_real_time, now()
  ) RETURNING id INTO v_quote_id;
  
  RETURN v_quote_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get latest quote with data source info
CREATE OR REPLACE FUNCTION get_latest_stock_quote(p_symbol text)
RETURNS TABLE (
  symbol text,
  bid decimal,
  ask decimal,
  last_price decimal,
  volume bigint,
  data_source_name text,
  is_mock boolean,
  is_real_time boolean,
  quote_timestamp timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sq.symbol,
    sq.bid,
    sq.ask,
    sq.last_price,
    sq.volume,
    ds.name as data_source_name,
    sq.is_mock,
    sq.is_real_time,
    sq.quote_timestamp
  FROM stock_quotes sq
  JOIN data_sources ds ON sq.data_source_id = ds.id
  WHERE sq.symbol = p_symbol
  ORDER BY sq.quote_timestamp DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;