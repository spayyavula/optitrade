import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import DisclaimerModal from './components/common/DisclaimerModal';
import ErrorBoundary from './components/common/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import OptionsChain from './pages/OptionsChain';
import Portfolio from './pages/Portfolio';
import StrategyBuilder from './pages/StrategyBuilder';
import Watchlist from './pages/Watchlist';
import Scanner from './pages/Scanner';
import Learn from './pages/Learn';

function App() {
  console.log('=== App Component Rendering ===');
  
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('App useEffect running...');
    
    // Enhanced error logging
    const handleError = (event: ErrorEvent) => {
      console.error('=== APP LEVEL ERROR ===');
      console.error('Message:', event.message);
      console.error('Filename:', event.filename);
      console.error('Line:', event.lineno);
      console.error('Column:', event.colno);
      console.error('Error object:', event.error);
      console.error('Stack trace:', event.error?.stack);
      console.error('=====================');
      setError(`Application Error: ${event.error?.message || 'Unknown error'}`);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('=== APP LEVEL PROMISE REJECTION ===');
      console.error('Reason:', event.reason);
      console.error('Promise:', event.promise);
      console.error('================================');
      setError(`Promise Rejection: ${event.reason?.message || 'Unknown rejection'}`);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Check disclaimer status
    try {
      console.log('Checking disclaimer status...');
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

    return () => {
      console.log('App cleanup running...');
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handleAcceptDisclaimer = () => {
    console.log('=== DISCLAIMER ACCEPTANCE ===');
    try {
      console.log('Setting disclaimer acceptance...');
      setHasAcceptedDisclaimer(true);
      localStorage.setItem('optionsworld-disclaimer-accepted', 'true');
      localStorage.setItem('optionsworld-disclaimer-date', new Date().toISOString());
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

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-neutral-900">
        <DisclaimerModal 
          isOpen={!hasAcceptedDisclaimer}
          onAccept={handleAcceptDisclaimer}
        />
        
        {hasAcceptedDisclaimer ? (
          <Router>
            <Routes>
              <Route path="/\" element={<Layout />}>
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
        ) : (
          <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
            <div className="text-center text-neutral-400">
              <p>Please accept the disclaimer to continue...</p>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;