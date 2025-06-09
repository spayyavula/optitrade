import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import DisclaimerModal from './components/common/DisclaimerModal';
import Dashboard from './pages/Dashboard';
import OptionsChain from './pages/OptionsChain';
import Portfolio from './pages/Portfolio';
import StrategyBuilder from './pages/StrategyBuilder';
import Watchlist from './pages/Watchlist';
import Scanner from './pages/Scanner';
import Learn from './pages/Learn';

function App() {
  console.log('=== App Component Rendering ===');
  console.log('React version:', React.version);
  
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('App useEffect running...');
    console.log('localStorage available:', typeof Storage !== 'undefined');
    
    // Check disclaimer status
    try {
      console.log('Checking disclaimer status...');
      
      if (typeof Storage === 'undefined') {
        console.warn('localStorage not available, proceeding without disclaimer check');
        setHasAcceptedDisclaimer(false);
        setIsLoading(false);
        return;
      }
      
      const disclaimerAccepted = localStorage.getItem('optionsworld-disclaimer-accepted');
      const disclaimerDate = localStorage.getItem('optionsworld-disclaimer-date');
      
      console.log('Disclaimer accepted:', disclaimerAccepted);
      console.log('Disclaimer date:', disclaimerDate);
      
      if (disclaimerAccepted === 'true') {
        console.log('Disclaimer previously accepted, proceeding to app');
        setHasAcceptedDisclaimer(true);
      } else {
        console.log('Disclaimer not accepted, showing modal');
        setHasAcceptedDisclaimer(false);
      }
    } catch (err) {
      console.error('Error checking disclaimer status:', err);
      setError('Failed to check disclaimer status');
    } finally {
      setIsLoading(false);
      console.log('App initialization completed');
    }
  }, []);

  const handleAcceptDisclaimer = () => {
    console.log('=== DISCLAIMER ACCEPTANCE ===');
    try {
      console.log('Setting disclaimer acceptance...');
      setHasAcceptedDisclaimer(true);
      
      if (typeof Storage !== 'undefined') {
        localStorage.setItem('optionsworld-disclaimer-accepted', 'true');
        localStorage.setItem('optionsworld-disclaimer-date', new Date().toISOString());
        console.log('Disclaimer acceptance saved to localStorage');
      } else {
        console.warn('localStorage not available, disclaimer acceptance not persisted');
      }
      
      console.log('Disclaimer accepted successfully, entering application');
    } catch (err) {
      console.error('Error saving disclaimer acceptance:', err);
      setError('Failed to save disclaimer acceptance');
    }
    console.log('============================');
  };

  // Loading state
  if (isLoading) {
    console.log('App is loading...');
    return (
      <div className="min-h-screen bg-neutral-900 text-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-neutral-400">Loading OptionsWorld...</p>
          <p className="text-neutral-500 text-sm mt-2">Initializing application...</p>
        </div>
      </div>
    );
  }

  // Error display
  if (error) {
    console.log('App showing error state:', error);
    return (
      <div className="min-h-screen bg-neutral-900 text-neutral-100 flex items-center justify-center p-4">
        <div className="bg-error-900 border border-error-700 p-6 rounded-lg max-w-md w-full">
          <h2 className="text-xl font-bold text-error-300 mb-4">Application Error</h2>
          <p className="text-error-200 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary w-full"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  console.log('App rendering main content...');
  console.log('Has accepted disclaimer:', hasAcceptedDisclaimer);

  // Show disclaimer modal if not accepted
  if (!hasAcceptedDisclaimer) {
    console.log('Showing disclaimer modal');
    return (
      <div className="min-h-screen bg-neutral-900">
        <DisclaimerModal 
          isOpen={true}
          onAccept={handleAcceptDisclaimer}
        />
      </div>
    );
  }

  // Main application with router
  console.log('Rendering main application with router');
  return (
    <div className="min-h-screen bg-neutral-900">
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="options-chain" element={<OptionsChain />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="strategy-builder" element={<StrategyBuilder />} />
            <Route path="watchlist" element={<Watchlist />} />
            <Route path="scanner" element={<Scanner />} />
            <Route path="learn" element={<Learn />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;