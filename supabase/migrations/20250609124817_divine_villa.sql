/*
  # Payments and Billing Tables

  1. New Tables
    - `payments` - Store payment records from Stripe
    - `billing_addresses` - Store customer billing information
    - `subscription_plans` - Define available subscription plans

  2. Security
    - Enable RLS on all tables
    - Add policies for user access to their own data
*/

-- Payments table to store Stripe payment records
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid REFERENCES subscribers(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_payment_intent_id text,
  stripe_invoice_id text,
  amount integer NOT NULL, -- Amount in cents
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled', 'refunded')),
  payment_method text DEFAULT 'card',
  description text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Billing addresses table
CREATE TABLE IF NOT EXISTS billing_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  stripe_customer_id text,
  line1 text NOT NULL,
  line2 text,
  city text NOT NULL,
  state text,
  postal_code text NOT NULL,
  country text NOT NULL DEFAULT 'US',
  is_default boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  stripe_price_id text UNIQUE NOT NULL,
  amount integer NOT NULL, -- Amount in cents
  currency text NOT NULL DEFAULT 'usd',
  interval_type text NOT NULL CHECK (interval_type IN ('month', 'year')),
  interval_count integer NOT NULL DEFAULT 1,
  trial_period_days integer DEFAULT 0,
  is_active boolean DEFAULT true,
  features jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_subscriber ON payments(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_customer ON payments(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_subscription ON payments(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

CREATE INDEX IF NOT EXISTS idx_billing_addresses_subscriber ON billing_addresses(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_billing_addresses_stripe_customer ON billing_addresses(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_stripe_price ON subscription_plans(stripe_price_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active) WHERE is_active = true;

-- RLS Policies

-- Payments - users can view their own payments, service role can manage all
CREATE POLICY "Users can view their own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subscribers s 
      WHERE s.id = payments.subscriber_id 
      AND s.email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Service role can manage all payments"
  ON payments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Billing addresses - users can manage their own
CREATE POLICY "Users can manage their own billing addresses"
  ON billing_addresses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subscribers s 
      WHERE s.id = billing_addresses.subscriber_id 
      AND s.email = auth.jwt() ->> 'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM subscribers s 
      WHERE s.id = billing_addresses.subscriber_id 
      AND s.email = auth.jwt() ->> 'email'
    )
  );

-- Subscription plans - public read access for active plans
CREATE POLICY "Public read access to active subscription plans"
  ON subscription_plans
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Service role can manage subscription plans"
  ON subscription_plans
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, stripe_price_id, amount, interval_type, trial_period_days, features) VALUES
(
  'Professional Monthly',
  'Full access to OptionsWorld with monthly billing',
  'price_monthly_10_usd',
  1000, -- $10.00
  'month',
  30, -- 30-day trial
  '["Real-time market data", "AI strategy recommendations", "Advanced analytics", "Portfolio tracking", "Educational content", "Email support"]'::jsonb
),
(
  'Professional Annual',
  'Full access to OptionsWorld with annual billing - save 2 months!',
  'price_annual_100_usd',
  10000, -- $100.00
  'year',
  30, -- 30-day trial
  '["Real-time market data", "AI strategy recommendations", "Advanced analytics", "Portfolio tracking", "Educational content", "Priority support", "Advanced backtesting", "Custom indicators"]'::jsonb
)
ON CONFLICT (stripe_price_id) DO NOTHING;