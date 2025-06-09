/*
  # Subscriber and Contact Management System

  1. New Tables
    - `subscribers` - Store subscriber information and preferences
    - `email_templates` - Reusable email templates
    - `email_logs` - Track all sent emails
    - `sms_logs` - Track all sent SMS messages
    - `campaigns` - Email/SMS campaigns
    - `campaign_subscribers` - Many-to-many relationship for campaigns
    - `unsubscribes` - Track unsubscribe requests

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for data access
*/

-- Subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  phone text,
  first_name text,
  last_name text,
  subscription_status text NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired')),
  email_verified boolean DEFAULT false,
  phone_verified boolean DEFAULT false,
  marketing_consent boolean DEFAULT false,
  sms_consent boolean DEFAULT false,
  source text NOT NULL CHECK (source IN ('landing_page', 'trial_signup', 'payment', 'referral')),
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  subscription_started_at timestamptz,
  last_login_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  html_content text NOT NULL,
  text_content text NOT NULL,
  template_type text NOT NULL CHECK (template_type IN ('welcome', 'trial_reminder', 'payment_reminder', 'newsletter', 'promotional')),
  is_active boolean DEFAULT true,
  variables jsonb DEFAULT '[]', -- Array of variable names used in template
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Email logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid REFERENCES subscribers(id) ON DELETE CASCADE,
  email_template_id uuid REFERENCES email_templates(id) ON DELETE SET NULL,
  email_type text NOT NULL,
  recipient_email text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  external_id text, -- ID from email service provider
  opened_at timestamptz,
  clicked_at timestamptz,
  bounced_at timestamptz,
  error_message text,
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- SMS logs table
CREATE TABLE IF NOT EXISTS sms_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid REFERENCES subscribers(id) ON DELETE CASCADE,
  phone text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'undelivered')),
  external_id text, -- ID from SMS service provider
  delivered_at timestamptz,
  error_message text,
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('email', 'sms', 'both')),
  subject text, -- For email campaigns
  content text NOT NULL,
  email_template_id uuid REFERENCES email_templates(id) ON DELETE SET NULL,
  scheduled_at timestamptz,
  sent_at timestamptz,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  target_audience text NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'trial', 'active', 'cancelled', 'custom')),
  target_filters jsonb DEFAULT '{}',
  stats jsonb DEFAULT '{"sent": 0, "delivered": 0, "opened": 0, "clicked": 0, "bounced": 0}',
  created_by uuid, -- References auth.users
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Campaign subscribers junction table
CREATE TABLE IF NOT EXISTS campaign_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  subscriber_id uuid NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  sent_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(campaign_id, subscriber_id)
);

-- Unsubscribes table
CREATE TABLE IF NOT EXISTS unsubscribes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid REFERENCES subscribers(id) ON DELETE CASCADE,
  email text NOT NULL,
  unsubscribe_type text NOT NULL CHECK (unsubscribe_type IN ('all', 'marketing', 'transactional', 'sms')),
  reason text,
  source text, -- 'email_link', 'sms_reply', 'manual', etc.
  created_at timestamptz DEFAULT now()
);

-- Contact preferences table
CREATE TABLE IF NOT EXISTS contact_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  email_marketing boolean DEFAULT true,
  email_transactional boolean DEFAULT true,
  email_educational boolean DEFAULT true,
  sms_marketing boolean DEFAULT false,
  sms_alerts boolean DEFAULT false,
  frequency text DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'never')),
  timezone text DEFAULT 'UTC',
  preferred_time time DEFAULT '09:00:00',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(subscriber_id)
);

-- Enable Row Level Security
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE unsubscribes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_preferences ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(subscription_status);
CREATE INDEX IF NOT EXISTS idx_subscribers_trial_ends ON subscribers(trial_ends_at) WHERE trial_ends_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscribers_source ON subscribers(source);
CREATE INDEX IF NOT EXISTS idx_subscribers_consent ON subscribers(marketing_consent, sms_consent);

CREATE INDEX IF NOT EXISTS idx_email_logs_subscriber ON email_logs(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(email_type);

CREATE INDEX IF NOT EXISTS idx_sms_logs_subscriber ON sms_logs(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_status ON sms_logs(status);
CREATE INDEX IF NOT EXISTS idx_sms_logs_sent_at ON sms_logs(sent_at);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled ON campaigns(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_campaigns_audience ON campaigns(target_audience);

CREATE INDEX IF NOT EXISTS idx_campaign_subscribers_campaign ON campaign_subscribers(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_subscribers_subscriber ON campaign_subscribers(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_campaign_subscribers_status ON campaign_subscribers(status);

-- RLS Policies

-- Subscribers - admin access only for now, users can view their own
CREATE POLICY "Users can view their own subscriber record"
  ON subscribers
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Service role can manage all subscribers"
  ON subscribers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Email templates - public read for active templates
CREATE POLICY "Public read access to active email templates"
  ON email_templates
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Service role can manage email templates"
  ON email_templates
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Email logs - admin access only
CREATE POLICY "Service role can manage email logs"
  ON email_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- SMS logs - admin access only
CREATE POLICY "Service role can manage SMS logs"
  ON sms_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Campaigns - admin access only
CREATE POLICY "Service role can manage campaigns"
  ON campaigns
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Campaign subscribers - admin access only
CREATE POLICY "Service role can manage campaign subscribers"
  ON campaign_subscribers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Unsubscribes - users can create their own, admin can view all
CREATE POLICY "Users can create unsubscribe requests"
  ON unsubscribes
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Service role can manage unsubscribes"
  ON unsubscribes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Contact preferences - users can manage their own
CREATE POLICY "Users can manage their own contact preferences"
  ON contact_preferences
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subscribers s 
      WHERE s.id = contact_preferences.subscriber_id 
      AND s.email = auth.jwt() ->> 'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM subscribers s 
      WHERE s.id = contact_preferences.subscriber_id 
      AND s.email = auth.jwt() ->> 'email'
    )
  );

-- Functions for subscriber management

-- Function to add subscriber with automatic welcome sequence
CREATE OR REPLACE FUNCTION add_subscriber_with_welcome(
  p_email text,
  p_phone text DEFAULT NULL,
  p_first_name text DEFAULT NULL,
  p_last_name text DEFAULT NULL,
  p_source text DEFAULT 'landing_page',
  p_marketing_consent boolean DEFAULT false,
  p_sms_consent boolean DEFAULT false
) RETURNS uuid AS $$
DECLARE
  v_subscriber_id uuid;
  v_trial_end timestamptz;
BEGIN
  -- Calculate trial end date (30 days from now)
  v_trial_end := now() + interval '30 days';
  
  -- Insert subscriber
  INSERT INTO subscribers (
    email, phone, first_name, last_name, source,
    marketing_consent, sms_consent, subscription_status,
    trial_started_at, trial_ends_at
  ) VALUES (
    lower(p_email), p_phone, p_first_name, p_last_name, p_source,
    p_marketing_consent, p_sms_consent, 
    CASE WHEN p_source = 'trial_signup' THEN 'trial' ELSE 'active' END,
    CASE WHEN p_source = 'trial_signup' THEN now() ELSE NULL END,
    CASE WHEN p_source = 'trial_signup' THEN v_trial_end ELSE NULL END
  ) RETURNING id INTO v_subscriber_id;
  
  -- Create default contact preferences
  INSERT INTO contact_preferences (subscriber_id)
  VALUES (v_subscriber_id);
  
  RETURN v_subscriber_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get subscribers needing trial reminders
CREATE OR REPLACE FUNCTION get_trial_reminder_subscribers(p_days_before integer DEFAULT 3)
RETURNS TABLE (
  id uuid,
  email text,
  first_name text,
  trial_ends_at timestamptz,
  days_left integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.email,
    s.first_name,
    s.trial_ends_at,
    EXTRACT(days FROM s.trial_ends_at - now())::integer as days_left
  FROM subscribers s
  WHERE s.subscription_status = 'trial'
    AND s.trial_ends_at IS NOT NULL
    AND s.trial_ends_at > now()
    AND EXTRACT(days FROM s.trial_ends_at - now()) <= p_days_before
    AND NOT EXISTS (
      SELECT 1 FROM email_logs el 
      WHERE el.subscriber_id = s.id 
      AND el.email_type = 'trial_reminder'
      AND el.sent_at > now() - interval '24 hours'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to update email engagement stats
CREATE OR REPLACE FUNCTION update_email_engagement(
  p_email_log_id uuid,
  p_event_type text, -- 'opened', 'clicked', 'bounced'
  p_timestamp timestamptz DEFAULT now()
) RETURNS boolean AS $$
BEGIN
  UPDATE email_logs 
  SET 
    status = p_event_type,
    opened_at = CASE WHEN p_event_type = 'opened' THEN p_timestamp ELSE opened_at END,
    clicked_at = CASE WHEN p_event_type = 'clicked' THEN p_timestamp ELSE clicked_at END,
    bounced_at = CASE WHEN p_event_type = 'bounced' THEN p_timestamp ELSE bounced_at END
  WHERE id = p_email_log_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;