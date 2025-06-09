-- Insert default email templates

INSERT INTO email_templates (name, subject, html_content, text_content, template_type, variables) VALUES
(
  'Welcome Email',
  'Welcome to OptionsWorld - Your Trading Journey Begins!',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to OptionsWorld</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0ea5e9, #14b8a6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to OptionsWorld!</h1>
      <p>Your advanced options trading journey starts now</p>
    </div>
    <div class="content">
      <h2>Hi {{first_name}},</h2>
      <p>Welcome to OptionsWorld! We''re excited to have you join our community of professional options traders.</p>
      
      <p><strong>Your {{subscription_type}} is now active!</strong> {{trial_message}}</p>
      
      <a href="https://optionsworld.com/dashboard" class="button">Start Trading Now</a>
      
      <h3>Quick Start Guide:</h3>
      <ol>
        <li>Complete your profile setup</li>
        <li>Take the options knowledge assessment</li>
        <li>Explore the AI strategy builder</li>
        <li>Join your first educational tournament</li>
      </ol>
      
      <p>Need help? Our support team is here for you:</p>
      <ul>
        <li>📧 Email: support@optionsworld.com</li>
        <li>💬 Live chat in the platform</li>
        <li>📚 Knowledge base: help.optionsworld.com</li>
      </ul>
    </div>
    <div class="footer">
      <p>Happy trading!<br>The OptionsWorld Team</p>
      <p><small>This email was sent to {{email}}. <a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="{{preferences_url}}">Update preferences</a></small></p>
    </div>
  </div>
</body>
</html>',
  'Welcome to OptionsWorld!

Hi {{first_name}},

Welcome to OptionsWorld! We''re excited to have you join our community of professional options traders.

Your {{subscription_type}} is now active! {{trial_message}}

Features included:
- Real-time options chain with live Greeks
- AI-powered strategy recommendations  
- Advanced market scanner and arbitrage detection
- Educational tournaments and challenges
- Risk management and portfolio tracking

Get started: https://optionsworld.com/dashboard

Quick Start Guide:
1. Complete your profile setup
2. Take the options knowledge assessment
3. Explore the AI strategy builder
4. Join your first educational tournament

Need help?
- Email: support@optionsworld.com
- Live chat in the platform
- Knowledge base: help.optionsworld.com

Happy trading!
The OptionsWorld Team

This email was sent to {{email}}.
Unsubscribe: {{unsubscribe_url}}',
  'welcome',
  '["first_name", "email", "subscription_type", "trial_message", "unsubscribe_url", "preferences_url"]'::jsonb
),
(
  'Trial Reminder - 3 Days',
  '⏰ 3 Days Left in Your OptionsWorld Trial',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your OptionsWorld Trial Expires Soon</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .highlight { background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ {{days_left}} Days Left in Your Trial</h1>
      <p>Don''t lose access to your trading edge</p>
    </div>
    <div class="content">
      <h2>Hi {{first_name}},</h2>
      
      <div class="highlight">
        <strong>Your OptionsWorld trial expires in {{days_left}} day{{days_plural}}!</strong>
      </div>
      
      <p>We hope you''ve been enjoying the advanced features of OptionsWorld. Here''s what you''ll lose access to when your trial ends:</p>
      
      <ul>
        <li>❌ Real-time options data and live Greeks</li>
        <li>❌ AI strategy recommendations</li>
        <li>❌ Advanced market scanner</li>
        <li>❌ Educational tournaments with cash prizes</li>
        <li>❌ Portfolio tracking and risk management</li>
      </ul>
      
      <p><strong>Continue your journey for just $10/month</strong> and keep all these powerful tools at your fingertips.</p>
      
      <a href="https://optionsworld.com/subscribe" class="button">Subscribe Now - $10/month</a>
      
      <p>Questions? Reply to this email or contact our support team.</p>
    </div>
  </div>
</body>
</html>',
  '⏰ {{days_left}} Days Left in Your OptionsWorld Trial

Hi {{first_name}},

Your OptionsWorld trial expires in {{days_left}} day{{days_plural}}!

What you''ll lose access to:
- Real-time options data and live Greeks
- AI strategy recommendations
- Advanced market scanner
- Educational tournaments with cash prizes
- Portfolio tracking and risk management

Continue your journey for just $10/month and keep all these powerful tools.

Subscribe now: https://optionsworld.com/subscribe

Questions? Reply to this email or contact support.

The OptionsWorld Team',
  'trial_reminder',
  '["first_name", "days_left", "days_plural"]'::jsonb
),
(
  'Payment Reminder',
  'Your OptionsWorld Subscription Payment Failed',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment Issue - OptionsWorld</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .alert { background: #fee2e2; padding: 15px; border-radius: 6px; border-left: 4px solid #ef4444; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Issue</h1>
      <p>We couldn''t process your payment</p>
    </div>
    <div class="content">
      <h2>Hi {{first_name}},</h2>
      
      <div class="alert">
        <strong>We were unable to process your payment for OptionsWorld.</strong>
      </div>
      
      <p>Your subscription will be suspended in {{grace_days}} days if we don''t receive payment. To avoid any interruption to your service:</p>
      
      <ol>
        <li>Check that your payment method is valid</li>
        <li>Ensure sufficient funds are available</li>
        <li>Update your billing information if needed</li>
      </ol>
      
      <a href="https://optionsworld.com/billing" class="button">Update Payment Method</a>
      
      <p>If you continue to experience issues, please contact our support team at support@optionsworld.com</p>
    </div>
  </div>
</body>
</html>',
  'Payment Issue - OptionsWorld

Hi {{first_name}},

We were unable to process your payment for OptionsWorld.

Your subscription will be suspended in {{grace_days}} days if we don''t receive payment. To avoid interruption:

1. Check that your payment method is valid
2. Ensure sufficient funds are available  
3. Update your billing information if needed

Update payment method: https://optionsworld.com/billing

Contact support: support@optionsworld.com

The OptionsWorld Team',
  'payment_reminder',
  '["first_name", "grace_days"]'::jsonb
),
(
  'Monthly Newsletter',
  'OptionsWorld Monthly: Market Insights & New Features',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>OptionsWorld Monthly Newsletter</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0ea5e9, #14b8a6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
    .section { margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb; }
    .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>OptionsWorld Monthly</h1>
      <p>{{month_year}} Edition</p>
    </div>
    <div class="content">
      <h2>Hi {{first_name}},</h2>
      
      <div class="section">
        <h3>🚀 New Features This Month</h3>
        <p>{{new_features}}</p>
      </div>
      
      <div class="section">
        <h3>📊 Market Insights</h3>
        <p>{{market_insights}}</p>
      </div>
      
      <div class="section">
        <h3>🎓 Educational Content</h3>
        <p>{{educational_content}}</p>
      </div>
      
      <div class="section">
        <h3>🏆 Community Highlights</h3>
        <p>{{community_highlights}}</p>
      </div>
      
      <a href="https://optionsworld.com/dashboard" class="button">Visit Platform</a>
    </div>
  </div>
</body>
</html>',
  'OptionsWorld Monthly: {{month_year}} Edition

Hi {{first_name}},

🚀 New Features This Month
{{new_features}}

📊 Market Insights  
{{market_insights}}

🎓 Educational Content
{{educational_content}}

🏆 Community Highlights
{{community_highlights}}

Visit the platform: https://optionsworld.com/dashboard

The OptionsWorld Team',
  'newsletter',
  '["first_name", "month_year", "new_features", "market_insights", "educational_content", "community_highlights"]'::jsonb
)
ON CONFLICT (name) DO NOTHING;