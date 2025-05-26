import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import OptionsChain from './pages/OptionsChain';
import Portfolio from './pages/Portfolio';
import StrategyBuilder from './pages/StrategyBuilder';
import Watchlist from './pages/Watchlist';
import Scanner from './pages/Scanner';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/options-chain" element={<OptionsChain />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/strategy-builder" element={<StrategyBuilder />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/scanner" element={<Scanner />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;