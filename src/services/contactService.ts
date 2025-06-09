import { supabase } from './supabaseService';

export interface Subscriber {
  id: string;
  email: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  subscription_status: 'trial' | 'active' | 'cancelled' | 'expired';
  email_verified: boolean;
  phone_verified: boolean;
  marketing_consent: boolean;
  sms_consent: boolean;
  source: 'landing_page' | 'trial_signup' | 'payment' | 'referral';
  trial_started_at?: string;
  trial_ends_at?: string;
  subscription_started_at?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  text_content: string;
  template_type: 'welcome' | 'trial_reminder' | 'payment_reminder' | 'newsletter' | 'promotional';
  is_active: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'both';
  subject?: string;
  content: string;
  scheduled_at?: string;
  sent_at?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  target_audience: 'all' | 'trial' | 'active' | 'cancelled' | 'custom';
  open_rate?: number;
  click_rate?: number;
  created_at: string;
}

export class ContactService {
  // Add subscriber from landing page
  static async addSubscriber(data: {
    email: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    source: 'landing_page' | 'trial_signup' | 'payment' | 'referral';
    marketingConsent?: boolean;
    smsConsent?: boolean;
  }): Promise<Subscriber | null> {
    if (!supabase) {
      console.warn('Supabase not available - subscriber not added');
      return null;
    }

    try {
      const { data: subscriber, error } = await supabase
        .from('subscribers')
        .insert({
          email: data.email.toLowerCase(),
          phone: data.phone,
          first_name: data.firstName,
          last_name: data.lastName,
          source: data.source,
          marketing_consent: data.marketingConsent || false,
          sms_consent: data.smsConsent || false,
          subscription_status: data.source === 'trial_signup' ? 'trial' : 'active',
          trial_started_at: data.source === 'trial_signup' ? new Date().toISOString() : null,
          trial_ends_at: data.source === 'trial_signup' 
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
            : null
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding subscriber:', error);
        return null;
      }

      // Send welcome email
      if (subscriber) {
        await this.sendWelcomeEmail(subscriber);
        
        // Send welcome SMS if phone provided and consent given
        if (subscriber.phone && subscriber.sms_consent) {
          await this.sendWelcomeSMS(subscriber);
        }
      }

      return subscriber;
    } catch (error) {
      console.error('Error in addSubscriber:', error);
      return null;
    }
  }

  // Update subscriber information
  static async updateSubscriber(
    subscriberId: string, 
    updates: Partial<Subscriber>
  ): Promise<boolean> {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('subscribers')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriberId);

      if (error) {
        console.error('Error updating subscriber:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateSubscriber:', error);
      return false;
    }
  }

  // Get subscriber by email
  static async getSubscriberByEmail(email: string): Promise<Subscriber | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error) {
        console.error('Error fetching subscriber:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getSubscriberByEmail:', error);
      return null;
    }
  }

  // Send welcome email
  static async sendWelcomeEmail(subscriber: Subscriber): Promise<boolean> {
    try {
      // In a real implementation, this would integrate with an email service like SendGrid, Mailgun, or AWS SES
      console.log('Sending welcome email to:', subscriber.email);
      
      const emailContent = {
        to: subscriber.email,
        subject: 'Welcome to OptionsWorld - Your Trading Journey Begins!',
        html: this.generateWelcomeEmailHTML(subscriber),
        text: this.generateWelcomeEmailText(subscriber)
      };

      // Store email in database for tracking
      if (supabase) {
        await supabase.from('email_logs').insert({
          subscriber_id: subscriber.id,
          email_type: 'welcome',
          subject: emailContent.subject,
          status: 'sent',
          sent_at: new Date().toISOString()
        });
      }

      // Simulate email sending
      console.log('Welcome email sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  // Send welcome SMS
  static async sendWelcomeSMS(subscriber: Subscriber): Promise<boolean> {
    try {
      // In a real implementation, this would integrate with Twilio, AWS SNS, or similar
      console.log('Sending welcome SMS to:', subscriber.phone);
      
      const smsContent = `Welcome to OptionsWorld, ${subscriber.first_name || 'Trader'}! 🚀 Your ${subscriber.subscription_status === 'trial' ? 'free trial' : 'subscription'} is now active. Start exploring advanced options strategies at optionsworld.com. Reply STOP to opt out.`;

      // Store SMS in database for tracking
      if (supabase) {
        await supabase.from('sms_logs').insert({
          subscriber_id: subscriber.id,
          phone: subscriber.phone,
          message: smsContent,
          status: 'sent',
          sent_at: new Date().toISOString()
        });
      }

      console.log('Welcome SMS sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending welcome SMS:', error);
      return false;
    }
  }

  // Send trial reminder email
  static async sendTrialReminderEmail(subscriber: Subscriber, daysLeft: number): Promise<boolean> {
    try {
      const emailContent = {
        to: subscriber.email,
        subject: `${daysLeft} days left in your OptionsWorld trial`,
        html: this.generateTrialReminderHTML(subscriber, daysLeft),
        text: this.generateTrialReminderText(subscriber, daysLeft)
      };

      if (supabase) {
        await supabase.from('email_logs').insert({
          subscriber_id: subscriber.id,
          email_type: 'trial_reminder',
          subject: emailContent.subject,
          status: 'sent',
          sent_at: new Date().toISOString()
        });
      }

      console.log('Trial reminder email sent to:', subscriber.email);
      return true;
    } catch (error) {
      console.error('Error sending trial reminder:', error);
      return false;
    }
  }

  // Send promotional SMS
  static async sendPromotionalSMS(
    subscribers: Subscriber[], 
    message: string
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const subscriber of subscribers) {
      if (!subscriber.phone || !subscriber.sms_consent) {
        failed++;
        continue;
      }

      try {
        // In real implementation, would use SMS service
        console.log(`Sending promotional SMS to ${subscriber.phone}: ${message}`);
        
        if (supabase) {
          await supabase.from('sms_logs').insert({
            subscriber_id: subscriber.id,
            phone: subscriber.phone,
            message: message,
            status: 'sent',
            sent_at: new Date().toISOString()
          });
        }
        
        sent++;
      } catch (error) {
        console.error(`Failed to send SMS to ${subscriber.phone}:`, error);
        failed++;
      }
    }

    return { sent, failed };
  }

  // Get subscribers for campaign
  static async getSubscribersForCampaign(
    targetAudience: 'all' | 'trial' | 'active' | 'cancelled' | 'custom',
    customFilters?: any
  ): Promise<Subscriber[]> {
    if (!supabase) return [];

    try {
      let query = supabase.from('subscribers').select('*');

      switch (targetAudience) {
        case 'trial':
          query = query.eq('subscription_status', 'trial');
          break;
        case 'active':
          query = query.eq('subscription_status', 'active');
          break;
        case 'cancelled':
          query = query.eq('subscription_status', 'cancelled');
          break;
        case 'custom':
          if (customFilters) {
            // Apply custom filters
            Object.entries(customFilters).forEach(([key, value]) => {
              query = query.eq(key, value);
            });
          }
          break;
        // 'all' - no additional filters
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching subscribers for campaign:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSubscribersForCampaign:', error);
      return [];
    }
  }

  // Generate email templates
  private static generateWelcomeEmailHTML(subscriber: Subscriber): string {
    return `
      <!DOCTYPE html>
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
            <h2>Hi ${subscriber.first_name || 'Trader'},</h2>
            <p>Welcome to OptionsWorld! We're excited to have you join our community of professional options traders.</p>
            
            ${subscriber.subscription_status === 'trial' ? `
              <p><strong>Your free trial is now active!</strong> You have 30 days to explore all our premium features:</p>
              <ul>
                <li>Real-time options chain with live Greeks</li>
                <li>AI-powered strategy recommendations</li>
                <li>Advanced market scanner and arbitrage detection</li>
                <li>Educational tournaments and challenges</li>
                <li>Risk management and portfolio tracking</li>
              </ul>
            ` : `
              <p><strong>Your subscription is now active!</strong> You have full access to all OptionsWorld features.</p>
            `}
            
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
            <p><small>This email was sent to ${subscriber.email}. <a href="#">Unsubscribe</a> | <a href="#">Update preferences</a></small></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generateWelcomeEmailText(subscriber: Subscriber): string {
    return `
Welcome to OptionsWorld!

Hi ${subscriber.first_name || 'Trader'},

Welcome to OptionsWorld! We're excited to have you join our community of professional options traders.

${subscriber.subscription_status === 'trial' ? 
  'Your free trial is now active! You have 30 days to explore all our premium features.' :
  'Your subscription is now active! You have full access to all OptionsWorld features.'
}

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

This email was sent to ${subscriber.email}.
Unsubscribe: https://optionsworld.com/unsubscribe
    `;
  }

  private static generateTrialReminderHTML(subscriber: Subscriber, daysLeft: number): string {
    return `
      <!DOCTYPE html>
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
            <h1>⏰ ${daysLeft} Days Left in Your Trial</h1>
            <p>Don't lose access to your trading edge</p>
          </div>
          <div class="content">
            <h2>Hi ${subscriber.first_name || 'Trader'},</h2>
            
            <div class="highlight">
              <strong>Your OptionsWorld trial expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}!</strong>
            </div>
            
            <p>We hope you've been enjoying the advanced features of OptionsWorld. Here's what you'll lose access to when your trial ends:</p>
            
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
      </html>
    `;
  }

  private static generateTrialReminderText(subscriber: Subscriber, daysLeft: number): string {
    return `
⏰ ${daysLeft} Days Left in Your OptionsWorld Trial

Hi ${subscriber.first_name || 'Trader'},

Your OptionsWorld trial expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}!

What you'll lose access to:
- Real-time options data and live Greeks
- AI strategy recommendations
- Advanced market scanner
- Educational tournaments with cash prizes
- Portfolio tracking and risk management

Continue your journey for just $10/month and keep all these powerful tools.

Subscribe now: https://optionsworld.com/subscribe

Questions? Reply to this email or contact support.

The OptionsWorld Team
    `;
  }
}