import React, { useState } from 'react';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { getStripe, StripeService, STRIPE_PRICES } from '../../services/stripeService';
import { ContactService } from '../../services/contactService';
import { CreditCard, Lock, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface PaymentFormProps {
  planType: 'monthly' | 'annual';
  email: string;
  firstName?: string;
  lastName?: string;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  planType,
  email,
  firstName,
  lastName,
  onSuccess,
  onError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const planDetails = {
    monthly: { amount: 1000, name: 'Professional Monthly', interval: 'month' },
    annual: { amount: 10000, name: 'Professional Annual', interval: 'year' }
  };

  const plan = planDetails[planType];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsProcessing(true);
    setPaymentError(null);

    if (!stripe || !elements) {
      setPaymentError('Stripe has not loaded yet. Please try again.');
      setIsProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setPaymentError('Card element not found. Please refresh and try again.');
      setIsProcessing(false);
      return;
    }

    try {
      // Create or get customer
      let customer = await StripeService.getCustomerByEmail(email);
      if (!customer) {
        customer = await StripeService.createCustomer(
          email,
          firstName && lastName ? `${firstName} ${lastName}` : undefined,
          undefined,
          { source: 'optionsworld_subscription' }
        );
      }

      if (!customer) {
        throw new Error('Failed to create customer');
      }

      // Create subscription
      const priceId = planType === 'monthly' ? STRIPE_PRICES.MONTHLY : STRIPE_PRICES.ANNUAL;
      const subscription = await StripeService.createSubscription(
        email,
        priceId,
        undefined, // No trial for paid subscriptions
        {
          plan_type: planType,
          source: 'optionsworld_landing'
        }
      );

      if (!subscription) {
        throw new Error('Failed to create subscription');
      }

      // If this is a simulated environment, just proceed
      if (!StripeService.isAvailable()) {
        // Add subscriber to database
        const subscriber = await ContactService.addSubscriber({
          email,
          firstName,
          lastName,
          source: 'payment',
          marketingConsent: true,
          smsConsent: false
        });

        onSuccess({
          subscription,
          customer,
          subscriber,
          simulated: true
        });
        return;
      }

      // For real Stripe integration, confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        subscription.id, // This would be the client_secret in real implementation
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              email,
              name: firstName && lastName ? `${firstName} ${lastName}` : undefined,
            },
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message || 'Payment failed');
      }

      // Add subscriber to database
      const subscriber = await ContactService.addSubscriber({
        email,
        firstName,
        lastName,
        source: 'payment',
        marketingConsent: true,
        smsConsent: false
      });

      // Store payment info
      if (subscriber && paymentIntent) {
        await StripeService.handleSuccessfulPayment(
          subscriber.id,
          paymentIntent,
          {
            type: planType,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + (planType === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString()
          }
        );
      }

      onSuccess({
        paymentIntent,
        subscription,
        customer,
        subscriber
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setPaymentError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Plan Summary */}
      <div className="bg-neutral-750 p-4 rounded-lg border border-neutral-600">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">{plan.name}</h3>
          <span className="text-xl font-bold">
            ${plan.amount / 100}/{plan.interval}
          </span>
        </div>
        <p className="text-sm text-neutral-400">
          {planType === 'annual' && 'Save 2 months with annual billing!'}
          {planType === 'monthly' && 'Billed monthly, cancel anytime'}
        </p>
      </div>

      {/* Card Element */}
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          Payment Information
        </label>
        <div className="bg-neutral-800 border border-neutral-600 rounded-lg p-4">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#f5f5f5',
                  '::placeholder': {
                    color: '#a3a3a3',
                  },
                },
                invalid: {
                  color: '#ef4444',
                },
              },
            }}
          />
        </div>
      </div>

      {/* Error Display */}
      {paymentError && (
        <div className="bg-error-900/20 border border-error-700/30 p-3 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="text-error-400 mr-2" size={20} />
            <span className="text-error-300 text-sm">{paymentError}</span>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-neutral-750 p-3 rounded-lg">
        <div className="flex items-center text-sm text-neutral-300">
          <Lock size={16} className="text-success-400 mr-2" />
          <span>Your payment information is secure and encrypted</span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full btn-primary flex items-center justify-center py-3"
      >
        {isProcessing ? (
          <Loader size={20} className="animate-spin mr-2" />
        ) : (
          <CreditCard size={20} className="mr-2" />
        )}
        {isProcessing 
          ? 'Processing...' 
          : `Subscribe for $${plan.amount / 100}/${plan.interval}`
        }
      </button>

      {/* Terms */}
      <p className="text-xs text-neutral-500 text-center">
        By subscribing, you agree to our{' '}
        <a href="#" className="text-primary-400 hover:text-primary-300">Terms of Service</a> and{' '}
        <a href="#" className="text-primary-400 hover:text-primary-300">Privacy Policy</a>.
        You can cancel your subscription at any time.
      </p>
    </form>
  );
};

interface StripePaymentFormProps {
  planType: 'monthly' | 'annual';
  email: string;
  firstName?: string;
  lastName?: string;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = (props) => {
  const stripePromise = getStripe();

  if (!stripePromise) {
    return (
      <div className="bg-warning-900/20 border border-warning-700/30 p-4 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="text-warning-400 mr-2\" size={20} />
          <div>
            <p className="text-warning-300 font-medium">Payment Processing Unavailable</p>
            <p className="text-warning-200 text-sm">
              Stripe is not configured. In demo mode, subscription will be simulated.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default StripePaymentForm;