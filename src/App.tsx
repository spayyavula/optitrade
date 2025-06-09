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
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);

  useEffect(() => {
    // Check if user has previously accepted the disclaimer
    const disclaimerAccepted = localStorage.getItem('optionsworld-disclaimer-accepted');
    if (disclaimerAccepted === 'true') {
      setHasAcceptedDisclaimer(true);
    }
  }, []);

  const handleAcceptDisclaimer = () => {
    setHasAcceptedDisclaimer(true);
    localStorage.setItem('optionsworld-disclaimer-accepted', 'true');
    localStorage.setItem('optionsworld-disclaimer-date', new Date().toISOString());
  };

  return (
    <>
      <DisclaimerModal 
        isOpen={!hasAcceptedDisclaimer}
        onAccept={handleAcceptDisclaimer}
      />
      
      {hasAcceptedDisclaimer && (
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="/options-chain" element={<OptionsChain />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/strategy-builder" element={<StrategyBuilder />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/scanner" element={<Scanner />} />
              <Route path="/learn" element={<Learn />} />
            </Route>
          </Routes>
        </Router>
      )}
    </>
  );
}

export default App