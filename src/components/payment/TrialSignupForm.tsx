import React, { useState } from 'react';
import { Mail, User, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface TrialSignupFormProps {
  onSuccess: (subscriber: any) => void;
  onError: (error: string) => void;
  className?: string;
}

const TrialSignupForm: React.FC<TrialSignupFormProps> = ({
  onSuccess,
  onError,
  className = ''
}) => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    marketingConsent: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate email
      if (!formData.email || !formData.email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // Since Supabase is not configured, we'll simulate a successful signup
      console.log('Simulating trial signup for:', formData.email);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a mock subscriber object
      const mockSubscriber = {
        id: `mock_${Date.now()}`,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        subscription_status: 'trial',
        trial_started_at: new Date().toISOString(),
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      };

      setSubmitted(true);
      onSuccess(mockSubscriber);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div className={`bg-success-900/20 border border-success-700/30 p-6 rounded-lg ${className}`}>
        <div className="flex items-center mb-4">
          <CheckCircle className="text-success-400 mr-3" size={24} />
          <h3 className="text-lg font-semibold text-success-300">Free Trial Activated!</h3>
        </div>
        <div className="space-y-3">
          <p className="text-success-200">
            Welcome to OptionsWorld! Your 30-day free trial has been activated.
          </p>
          <div className="bg-success-800/30 p-3 rounded-lg">
            <h4 className="font-medium text-success-300 mb-2">What's Next:</h4>
            <ul className="text-sm text-success-200 space-y-1">
              <li>✅ Explore the AI strategy builder</li>
              <li>✅ Try the real-time options chain</li>
              <li>✅ Join educational tournaments</li>
              <li>✅ Practice with paper trading</li>
            </ul>
          </div>
          <div className="flex items-center text-sm text-success-300">
            <Clock size={16} className="mr-2" />
            <span>Trial expires in 30 days - no credit card required</span>
          </div>
          <div className="bg-warning-900/20 border border-warning-700/30 p-3 rounded-lg mt-4">
            <p className="text-warning-200 text-sm">
              <strong>Demo Mode:</strong> Since this is a demonstration, email notifications are simulated. 
              In production, you would receive a welcome email with login details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {error && (
        <div className="bg-error-900/20 border border-error-700/30 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="text-error-400 mr-2" size={20} />
            <span className="text-error-300">{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-neutral-300 mb-1">
            First Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="input w-full pl-10"
              placeholder="John"
            />
            <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
          </div>
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-neutral-300 mb-1">
            Last Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="input w-full pl-10"
              placeholder="Doe"
            />
            <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-1">
          Email Address *
        </label>
        <div className="relative">
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="input w-full pl-10"
            placeholder="john@example.com"
            required
          />
          <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-start cursor-pointer">
          <input
            type="checkbox"
            checked={formData.marketingConsent}
            onChange={(e) => handleInputChange('marketingConsent', e.target.checked)}
            className="mt-1 mr-3 w-4 h-4 text-primary-600 bg-neutral-700 border-neutral-600 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-neutral-300">
            I agree to receive emails about OptionsWorld features, market insights, and educational content. 
            You can unsubscribe at any time.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !formData.email}
        className="w-full btn-primary flex items-center justify-center"
      >
        {isSubmitting ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          <>
            <Clock size={18} className="mr-2" />
            Start 30-Day Free Trial
          </>
        )}
      </button>

      <div className="bg-primary-900/20 border border-primary-700/30 p-3 rounded-lg">
        <h4 className="font-medium text-primary-300 mb-2">What You Get:</h4>
        <ul className="text-sm text-primary-200 space-y-1">
          <li>✅ Full access to all premium features</li>
          <li>✅ Real-time market data and AI strategies</li>
          <li>✅ Educational tournaments and challenges</li>
          <li>✅ No credit card required</li>
          <li>✅ Cancel anytime during trial</li>
        </ul>
      </div>

      <div className="bg-warning-900/20 border border-warning-700/30 p-3 rounded-lg">
        <p className="text-warning-200 text-sm">
          <strong>Demo Notice:</strong> This is a demonstration platform. All trading is simulated for educational purposes only.
        </p>
      </div>

      <p className="text-xs text-neutral-500 text-center">
        By starting your trial, you agree to our{' '}
        <a href="#" className="text-primary-400 hover:text-primary-300">Terms of Service</a> and{' '}
        <a href="#" className="text-primary-400 hover:text-primary-300">Privacy Policy</a>.
      </p>
    </form>
  );
};

export default TrialSignupForm;