import React, { useState } from 'react';
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  Users, 
  CheckCircle, 
  Star, 
  ArrowRight, 
  Play,
  BarChart3,
  Target,
  Brain,
  Award,
  Clock,
  DollarSign,
  X
} from 'lucide-react';
import StripePaymentForm from '../components/payment/StripePaymentForm';
import TrialSignupForm from '../components/payment/TrialSignupForm';

const Landing: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<'trial' | 'monthly' | 'annual'>('trial');
  const [showPayment, setShowPayment] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const features = [
    {
      icon: <BarChart3 className="text-primary-400" size={24} />,
      title: "Real-Time Options Chain",
      description: "Live market data powered by Polygon.io with real-time Greeks and implied volatility calculations."
    },
    {
      icon: <Brain className="text-secondary-400" size={24} />,
      title: "AI Strategy Builder",
      description: "Advanced AI analyzes market regimes and recommends optimal options strategies based on current conditions."
    },
    {
      icon: <Target className="text-accent-400" size={24} />,
      title: "Risk Management Tools",
      description: "Comprehensive portfolio tracking with P&L analysis, position sizing, and risk metrics."
    },
    {
      icon: <TrendingUp className="text-success-400" size={24} />,
      title: "Market Scanner",
      description: "Identify arbitrage opportunities and mispriced options using Black-Scholes analysis."
    },
    {
      icon: <Award className="text-warning-400" size={24} />,
      title: "Educational Platform",
      description: "Learn options trading through interactive lessons, challenges, and company-sponsored tournaments."
    },
    {
      icon: <Shield className="text-error-400" size={24} />,
      title: "Paper Trading",
      description: "Practice with simulated trading in a risk-free environment before using real capital."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Quantitative Trader",
      company: "Goldman Sachs",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      content: "OptionsWorld's AI strategy recommendations have significantly improved my trading performance. The real-time data integration is flawless.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "Portfolio Manager",
      company: "JPMorgan Chase",
      image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      content: "The educational platform is exceptional. My team learned advanced options strategies through the interactive tournaments.",
      rating: 5
    },
    {
      name: "Emily Watson",
      role: "Risk Analyst",
      company: "Morgan Stanley",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      content: "Best options analysis platform I've used. The Black-Scholes integration and arbitrage scanner are game-changers.",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      id: 'trial',
      name: 'Free Trial',
      price: 0,
      duration: '30 Days',
      description: 'Perfect for getting started',
      features: [
        'Full platform access',
        'Real-time market data',
        'AI strategy recommendations',
        'Educational content',
        'Paper trading',
        'Email support'
      ],
      popular: true,
      cta: 'Start Free Trial'
    },
    {
      id: 'monthly',
      name: 'Professional',
      price: 10,
      duration: 'per month',
      description: 'For serious traders',
      features: [
        'Everything in Free Trial',
        'Advanced analytics',
        'Priority support',
        'Custom alerts',
        'Portfolio optimization',
        'API access'
      ],
      popular: false,
      cta: 'Subscribe Monthly'
    },
    {
      id: 'annual',
      name: 'Professional Annual',
      price: 100,
      duration: 'per year',
      description: 'Best value - 2 months free',
      features: [
        'Everything in Professional',
        '2 months free',
        'Premium support',
        'Advanced backtesting',
        'Custom indicators',
        'White-label options'
      ],
      popular: false,
      cta: 'Subscribe Annually'
    }
  ];

  const handlePaymentSuccess = (result: any) => {
    console.log('Payment successful:', result);
    setIsProcessing(false);
    setPaymentSuccess(true);
    setShowPayment(false);
    
    // In a real app, you might redirect to the dashboard or show a success page
    setTimeout(() => {
      alert('Payment successful! Welcome to OptionsWorld Professional.');
    }, 500);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    setIsProcessing(false);
    alert(`Payment failed: ${error}`);
  };

  const handleTrialSuccess = (subscriber: any) => {
    console.log('Trial signup successful:', subscriber);
    setPaymentSuccess(true);
    setShowPayment(false);
  };

  const handleTrialError = (error: string) => {
    console.error('Trial signup error:', error);
    alert(`Trial signup failed: ${error}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/20 to-secondary-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <TrendingUp className="text-primary-400 mr-3" size={48} />
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                OptionsWorld
              </h1>
            </div>
            
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-6">
              Master Options Trading with
              <span className="text-primary-400"> AI-Powered Insights</span>
            </h2>
            
            <p className="text-xl text-neutral-300 mb-8 max-w-3xl mx-auto">
              The most advanced options trading platform with real-time market data, 
              AI strategy recommendations, and comprehensive educational tools. 
              Used by professionals at Goldman Sachs, JPMorgan, and Morgan Stanley.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button 
                onClick={() => {
                  setSelectedPlan('trial');
                  setShowPayment(true);
                }}
                className="btn-primary text-lg px-8 py-4 flex items-center"
              >
                <Play size={20} className="mr-2" />
                Start Free Trial
              </button>
              <button className="btn-ghost text-lg px-8 py-4 flex items-center">
                <BarChart3 size={20} className="mr-2" />
                Watch Demo
              </button>
            </div>
            
            <div className="flex items-center justify-center text-sm text-neutral-400">
              <CheckCircle size={16} className="text-success-400 mr-2" />
              <span>No credit card required • 30-day free trial • Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-neutral-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to Trade Options
            </h2>
            <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
              Professional-grade tools and real-time data used by Wall Street traders, 
              now accessible to everyone.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 hover:border-primary-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-neutral-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by Wall Street Professionals
            </h2>
            <p className="text-xl text-neutral-300">
              See what industry leaders are saying about OptionsWorld
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-warning-400 fill-current" />
                  ))}
                </div>
                <p className="text-neutral-300 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-neutral-400">{testimonial.role}</p>
                    <p className="text-sm text-primary-400">{testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-neutral-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-neutral-300">
              Start with a free trial, then choose the plan that works for you
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div 
                key={plan.id}
                className={`relative bg-neutral-800 p-8 rounded-xl border-2 transition-all duration-300 hover:transform hover:scale-105 ${
                  plan.popular 
                    ? 'border-primary-500 bg-gradient-to-b from-primary-900/20 to-neutral-800' 
                    : 'border-neutral-700 hover:border-primary-500/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-neutral-400 mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    <span className="text-neutral-400 ml-2">{plan.duration}</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle size={16} className="text-success-400 mr-3 flex-shrink-0" />
                      <span className="text-neutral-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={() => {
                    setSelectedPlan(plan.id as any);
                    setShowPayment(true);
                  }}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                    plan.popular
                      ? 'bg-primary-600 hover:bg-primary-700 text-white'
                      : 'bg-neutral-700 hover:bg-neutral-600 text-white'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Options Trading?
          </h2>
          <p className="text-xl text-neutral-300 mb-8">
            Join thousands of traders who have already discovered the power of AI-driven options analysis.
          </p>
          <button 
            onClick={() => {
              setSelectedPlan('trial');
              setShowPayment(true);
            }}
            className="btn-primary text-lg px-8 py-4 flex items-center mx-auto"
          >
            Start Your Free Trial
            <ArrowRight size={20} className="ml-2" />
          </button>
        </div>
      </section>

      {/* Payment/Signup Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 rounded-xl shadow-xl w-full max-w-md border border-neutral-700 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {selectedPlan === 'trial' ? 'Start Free Trial' : 'Subscribe to Professional'}
                </h3>
                <button 
                  onClick={() => setShowPayment(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
              
              {selectedPlan === 'trial' ? (
                <TrialSignupForm
                  onSuccess={handleTrialSuccess}
                  onError={handleTrialError}
                />
              ) : (
                <div className="space-y-6">
                  {/* Contact Info */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="input w-full"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="input w-full"
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input w-full"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Stripe Payment Form */}
                  <StripePaymentForm
                    planType={selectedPlan as 'monthly' | 'annual'}
                    email={email}
                    firstName={firstName}
                    lastName={lastName}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-neutral-900 border-t border-neutral-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <TrendingUp className="text-primary-400 mr-2" size={24} />
                <span className="text-xl font-bold text-white">OptionsWorld</span>
              </div>
              <p className="text-neutral-400 text-sm">
                The most advanced options trading platform for professionals and enthusiasts.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Risk Disclosure</a></li>
                <li><a href="#" className="hover:text-white">Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-700 mt-8 pt-8 text-center">
            <p className="text-neutral-400 text-sm">
              © 2025 OptionsWorld. All rights reserved. | Educational Platform Only - Not Financial Advice
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;