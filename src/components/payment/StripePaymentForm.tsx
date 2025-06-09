import React, { useState } from 'react';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { getStripe } from '../../services/stripeService';
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

    try {
      // Since Stripe is not fully configured, we'll simulate a successful payment
      console.log('Simulating payment for:', { email, planType, amount: plan.amount });
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create mock payment result
      const mockResult = {
        paymentIntent: {
          id: `pi_mock_${Date.now()}`,
          status: 'succeeded',
          amount: plan.amount,
          currency: 'usd'
        },
        subscription: {
          id: `sub_mock_${Date.now()}`,
          status: 'active',
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor((Date.now() + (planType === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000) / 1000)
        },
        customer: {
          id: `cus_mock_${Date.now()}`,
          email: email
        },
        simulated: true
      };

      onSuccess(mockResult);
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

      {/* Demo Notice */}
      <div className="bg-warning-900/20 border border-warning-700/30 p-4 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="text-warning-400 mr-2" size={20} />
          <div>
            <p className="text-warning-300 font-medium">Demo Mode</p>
            <p className="text-warning-200 text-sm">
              This is a demonstration. No actual payment will be processed. Stripe integration is ready for production use.
            </p>
          </div>
        </div>
      </div>

      {/* Simulated Card Element */}
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          Payment Information (Demo)
        </label>
        <div className="bg-neutral-800 border border-neutral-600 rounded-lg p-4">
          <div className="text-neutral-400 text-sm">
            💳 Demo Card Information
            <br />
            Card Number: 4242 4242 4242 4242
            <br />
            Expiry: 12/34 | CVC: 123
          </div>
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
          <span>Stripe integration ready - payments would be secure and encrypted in production</span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isProcessing}
        className="w-full btn-primary flex items-center justify-center py-3"
      >
        {isProcessing ? (
          <Loader size={20} className="animate-spin mr-2" />
        ) : (
          <CreditCard size={20} className="mr-2" />
        )}
        {isProcessing 
          ? 'Processing Demo Payment...' 
          : `Demo Subscribe - $${plan.amount / 100}/${plan.interval}`
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

  return <PaymentForm {...props} />;
};

export default StripePaymentForm;