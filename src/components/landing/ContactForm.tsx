import React, { useState } from 'react';
import { Mail, Phone, User, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { ContactService } from '../../services/contactService';

interface ContactFormProps {
  source: 'landing_page' | 'trial_signup' | 'payment';
  onSuccess?: (subscriber: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ 
  source, 
  onSuccess, 
  onError, 
  className = '' 
}) => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    marketingConsent: false,
    smsConsent: false
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

      // Validate phone if provided
      if (formData.phone && formData.phone.length < 10) {
        throw new Error('Please enter a valid phone number');
      }

      const subscriber = await ContactService.addSubscriber({
        email: formData.email,
        phone: formData.phone || undefined,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        source,
        marketingConsent: formData.marketingConsent,
        smsConsent: formData.smsConsent && !!formData.phone
      });

      if (subscriber) {
        setSubmitted(true);
        onSuccess?.(subscriber);
      } else {
        throw new Error('Failed to create subscriber');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
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
          <h3 className="text-lg font-semibold text-success-300">Welcome to OptionsWorld!</h3>
        </div>
        <p className="text-success-200 mb-4">
          {source === 'trial_signup' 
            ? 'Your free trial has been activated! Check your email for login details.'
            : 'Thank you for subscribing! You\'ll receive a welcome email shortly.'
          }
        </p>
        <div className="text-sm text-success-300">
          <p>✅ Welcome email sent</p>
          {formData.phone && formData.smsConsent && (
            <p>✅ Welcome SMS sent</p>
          )}
          <p>✅ Account created</p>
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

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-neutral-300 mb-1">
          Phone Number (Optional)
        </label>
        <div className="relative">
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="input w-full pl-10"
            placeholder="+1 (555) 123-4567"
          />
          <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
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
            I agree to receive marketing emails about OptionsWorld features, market insights, and educational content. 
            You can unsubscribe at any time.
          </span>
        </label>

        {formData.phone && (
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={formData.smsConsent}
              onChange={(e) => handleInputChange('smsConsent', e.target.checked)}
              className="mt-1 mr-3 w-4 h-4 text-primary-600 bg-neutral-700 border-neutral-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-neutral-300">
              I agree to receive SMS notifications about my account, trading alerts, and important updates. 
              Message and data rates may apply. Reply STOP to opt out.
            </span>
          </label>
        )}
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
            <Send size={18} className="mr-2" />
            {source === 'trial_signup' ? 'Start Free Trial' : 'Subscribe Now'}
          </>
        )}
      </button>

      <p className="text-xs text-neutral-500 text-center">
        By submitting this form, you agree to our{' '}
        <a href="#" className="text-primary-400 hover:text-primary-300">Terms of Service</a> and{' '}
        <a href="#" className="text-primary-400 hover:text-primary-300">Privacy Policy</a>.
      </p>
    </form>
  );
};

export default ContactForm;