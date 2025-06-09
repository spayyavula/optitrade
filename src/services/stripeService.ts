import { loadStripe, Stripe } from '@stripe/stripe-js';
import { supabase } from './supabaseService';

// Initialize Stripe
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found. Payment processing will be simulated.');
}

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise && stripePublishableKey) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface Subscription {
  id: string;
  customer_id: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  plan_id: string;
  plan_amount: number;
  plan_interval: string;
}

export interface Customer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  created: number;
}

export class StripeService {
  // Check if Stripe is available
  static isAvailable(): boolean {
    return !!stripePublishableKey;
  }

  // Create a payment intent for one-time payments
  static async createPaymentIntent(
    amount: number, // Amount in cents
    currency: string = 'usd',
    customerEmail: string,
    metadata: Record<string, string> = {}
  ): Promise<PaymentIntent | null> {
    if (!this.isAvailable()) {
      console.warn('Stripe not available - simulating payment intent creation');
      return {
        id: `pi_simulated_${Date.now()}`,
        client_secret: `pi_simulated_${Date.now()}_secret`,
        amount,
        currency,
        status: 'requires_payment_method'
      };
    }

    try {
      // In a real implementation, this would call your backend API
      // which would then call Stripe's API with your secret key
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          customer_email: customerEmail,
          metadata
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const paymentIntent = await response.json();
      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return null;
    }
  }

  // Create a subscription
  static async createSubscription(
    customerEmail: string,
    priceId: string, // Stripe Price ID
    trialPeriodDays?: number,
    metadata: Record<string, string> = {}
  ): Promise<Subscription | null> {
    if (!this.isAvailable()) {
      console.warn('Stripe not available - simulating subscription creation');
      return {
        id: `sub_simulated_${Date.now()}`,
        customer_id: `cus_simulated_${Date.now()}`,
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
        plan_id: priceId,
        plan_amount: priceId.includes('monthly') ? 1000 : 10000, // $10 or $100
        plan_interval: priceId.includes('monthly') ? 'month' : 'year'
      };
    }

    try {
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_email: customerEmail,
          price_id: priceId,
          trial_period_days: trialPeriodDays,
          metadata
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      const subscription = await response.json();
      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      return null;
    }
  }

  // Create a customer
  static async createCustomer(
    email: string,
    name?: string,
    phone?: string,
    metadata: Record<string, string> = {}
  ): Promise<Customer | null> {
    if (!this.isAvailable()) {
      console.warn('Stripe not available - simulating customer creation');
      return {
        id: `cus_simulated_${Date.now()}`,
        email,
        name,
        phone,
        created: Math.floor(Date.now() / 1000)
      };
    }

    try {
      const response = await fetch('/api/create-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          phone,
          metadata
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create customer');
      }

      const customer = await response.json();
      return customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      return null;
    }
  }

  // Get customer by email
  static async getCustomerByEmail(email: string): Promise<Customer | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const response = await fetch(`/api/customers?email=${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch customer');
      }

      const customer = await response.json();
      return customer;
    } catch (error) {
      console.error('Error fetching customer:', error);
      return null;
    }
  }

  // Cancel subscription
  static async cancelSubscription(subscriptionId: string): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn('Stripe not available - simulating subscription cancellation');
      return true;
    }

    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return false;
    }
  }

  // Update subscription
  static async updateSubscription(
    subscriptionId: string,
    updates: {
      priceId?: string;
      quantity?: number;
      metadata?: Record<string, string>;
    }
  ): Promise<Subscription | null> {
    if (!this.isAvailable()) {
      console.warn('Stripe not available - simulating subscription update');
      return null;
    }

    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      const subscription = await response.json();
      return subscription;
    } catch (error) {
      console.error('Error updating subscription:', error);
      return null;
    }
  }

  // Store payment/subscription info in Supabase
  static async storePaymentInfo(
    subscriberId: string,
    paymentData: {
      stripe_customer_id?: string;
      stripe_subscription_id?: string;
      stripe_payment_intent_id?: string;
      amount: number;
      currency: string;
      status: string;
      payment_method?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<boolean> {
    if (!supabase) {
      console.warn('Supabase not available - payment info not stored');
      return false;
    }

    try {
      const { error } = await supabase
        .from('payments')
        .insert({
          subscriber_id: subscriberId,
          ...paymentData,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error storing payment info:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in storePaymentInfo:', error);
      return false;
    }
  }

  // Handle successful payment
  static async handleSuccessfulPayment(
    subscriberId: string,
    paymentIntent: PaymentIntent,
    subscriptionData?: {
      type: 'monthly' | 'annual';
      startDate: string;
      endDate: string;
    }
  ): Promise<boolean> {
    if (!supabase) {
      console.warn('Supabase not available - payment success not recorded');
      return false;
    }

    try {
      // Update subscriber status
      const updates: any = {
        subscription_status: 'active',
        subscription_started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (subscriptionData) {
        updates.subscription_type = subscriptionData.type;
        updates.subscription_end_date = subscriptionData.endDate;
      }

      const { error: subscriberError } = await supabase
        .from('subscribers')
        .update(updates)
        .eq('id', subscriberId);

      if (subscriberError) {
        console.error('Error updating subscriber:', subscriberError);
        return false;
      }

      // Store payment record
      await this.storePaymentInfo(subscriberId, {
        stripe_payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        payment_method: 'card'
      });

      return true;
    } catch (error) {
      console.error('Error handling successful payment:', error);
      return false;
    }
  }

  // Get subscription status
  static async getSubscriptionStatus(customerId: string): Promise<Subscription | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const response = await fetch(`/api/customers/${customerId}/subscription`);
      
      if (!response.ok) {
        return null;
      }

      const subscription = await response.json();
      return subscription;
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      return null;
    }
  }
}

// Stripe Price IDs (you'll need to create these in your Stripe dashboard)
export const STRIPE_PRICES = {
  MONTHLY: 'price_monthly_10_usd', // Replace with actual Stripe Price ID
  ANNUAL: 'price_annual_100_usd'   // Replace with actual Stripe Price ID
};