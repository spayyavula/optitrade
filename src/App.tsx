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
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Enhanced error logging
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      setError(`Application Error: ${event.error?.message || 'Unknown error'}`);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setError(`Promise Rejection: ${event.reason?.message || 'Unknown rejection'}`);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Check if user has previously accepted the disclaimer
    try {
      const disclaimerAccepted = localStorage.getItem('optionsworld-disclaimer-accepted');
      if (disclaimerAccepted === 'true') {
        setHasAcceptedDisclaimer(true);
        console.log('Disclaimer previously accepted, proceeding to app');
      } else {
        console.log('Disclaimer not accepted, showing modal');
      }
    } catch (err) {
      console.error('Error checking disclaimer status:', err);
    }

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handleAcceptDisclaimer = () => {
    try {
      setHasAcceptedDisclaimer(true);
      localStorage.setItem('optionsworld-disclaimer-accepted', 'true');
      localStorage.setItem('optionsworld-disclaimer-date', new Date().toISOString());
      console.log('Disclaimer accepted, entering application');
    } catch (err) {
      console.error('Error saving disclaimer acceptance:', err);
      setError('Failed to save disclaimer acceptance');
    }
  };

  // Error display
  if (error) {
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

  return (
    <ErrorBoundary>
      <DisclaimerModal 
        isOpen={!hasAcceptedDisclaimer}
        onAccept={handleAcceptDisclaimer}
      />
      
      {hasAcceptedDisclaimer && (
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
      )}
    </ErrorBoundary>
  );
}

export default App;