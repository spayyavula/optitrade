import React, { useState } from 'react';
import LivePriceDisplay from '../components/common/LivePriceDisplay';
import PriceChart from '../components/common/PriceChart';
import LiveOptionsChain from '../components/options/LiveOptionsChain';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import { mockAAPLData } from '../data/mockData';
import { PolygonOptionQuote } from '../services/polygonService';
import { AlertCircle, X, Activity } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

const OptionsChain: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [selectedExpiration, setSelectedExpiration] = useState('2025-01-17');
  const [selectedOption, setSelectedOption] = useState<PolygonOptionQuote | null>(null);
  const [isBuy, setIsBuy] = useState(true);
  const [showTrade, setShowTrade] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  const availableExpirations = [
    '2025-01-17',
    '2025-01-24',
    '2025-02-21',
    '2025-03-21',
    '2025-04-18',
    '2025-06-20'
  ];

  const handleOptionSelect = (option: PolygonOptionQuote, buy: boolean) => {
    setSelectedOption(option);
    setIsBuy(buy);
    setShowTrade(true);
  };

  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol.toUpperCase());
  };

  return (
    <div className="animate-fade-in">
      <DisclaimerBanner />
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">Live Options Chain</h1>
        
        {/* Symbol Selection */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center">
              <label htmlFor="symbol" className="text-sm text-neutral-400 mr-2">Symbol:</label>
              <input
                id="symbol"
                type="text"
                value={selectedSymbol}
                onChange={(e) => handleSymbolChange(e.target.value)}
                className="input w-24 text-center font-mono uppercase"
                placeholder="AAPL"
                maxLength={5}
              />
            </div>
            
            <div className="flex items-center">
              <Activity size={16} className="text-success-400 mr-2" />
              <span className="text-sm text-success-400">Real-time data via Polygon.io</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 card">
            <div className="mb-4 flex justify-between items-center">
              <div>
                <LivePriceDisplay 
                  symbol={selectedSymbol}
                  showChange={true}
                  showVolume={true}
                  size="lg"
                />
              </div>
              <div className="flex space-x-1 bg-neutral-700 p-1 rounded-lg">
                <button className="text-xs py-1 px-2 rounded-md bg-neutral-600 text-white">1D</button>
                <button className="text-xs py-1 px-2 rounded-md text-neutral-400 hover:bg-neutral-600/50">1W</button>
                <button className="text-xs py-1 px-2 rounded-md text-neutral-400 hover:bg-neutral-600/50">1M</button>
                <button className="text-xs py-1 px-2 rounded-md text-neutral-400 hover:bg-neutral-600/50">3M</button>
                <button className="text-xs py-1 px-2 rounded-md text-neutral-400 hover:bg-neutral-600/50">1Y</button>
              </div>
            </div>
            <PriceChart data={mockAAPLData} />
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Market Information</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm text-neutral-400 mb-1">{selectedSymbol} Corporation</h4>
                <p className="text-sm">
                  Real-time options data powered by Polygon.io. All prices and Greeks are 
                  calculated using live market data and Black-Scholes methodology.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <h4 className="text-xs text-neutral-400">Data Source</h4>
                  <p className="font-medium">Polygon.io</p>
                </div>
                <div>
                  <h4 className="text-xs text-neutral-400">Update Frequency</h4>
                  <p className="font-medium">Real-time</p>
                </div>
                <div>
                  <h4 className="text-xs text-neutral-400">Options Available</h4>
                  <p className="font-medium">Calls & Puts</p>
                </div>
                <div>
                  <h4 className="text-xs text-neutral-400">Greeks Included</h4>
                  <p className="font-medium">Δ, Γ, Θ, ν, IV</p>
                </div>
              </div>
              
              <div className="pt-3 border-t border-neutral-700">
                <h4 className="text-sm font-medium mb-2">Live Features</h4>
                <div className="text-sm space-y-1">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-success-400 rounded-full mr-2"></div>
                    <span>Real-time bid/ask spreads</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-success-400 rounded-full mr-2"></div>
                    <span>Live implied volatility</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-success-400 rounded-full mr-2"></div>
                    <span>Dynamic Greeks calculation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-xl font-semibold">Live Options Chain - {selectedSymbol}</h3>
            
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center bg-neutral-800 rounded-lg overflow-hidden">
                <span className="text-sm text-neutral-400 px-3">Expiration:</span>
                <select 
                  value={selectedExpiration}
                  onChange={(e) => setSelectedExpiration(e.target.value)}
                  className="select bg-transparent border-none text-sm py-2"
                >
                  {availableExpirations.map(date => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString()} ({Math.floor((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}d)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="bg-primary-900/20 border border-primary-700/30 p-3 rounded-lg mb-4 flex items-center">
            <Activity size={20} className="text-primary-400 mr-2" />
            <p className="text-sm">
              <strong>Live Market Data:</strong> Options prices update in real-time via Polygon.io WebSocket connection. 
              Greeks are calculated using Black-Scholes model with live implied volatility.
              <strong className="text-warning-400 ml-1">Educational platform - not for actual trading.</strong>
            </p>
          </div>
          
          <LiveOptionsChain 
            symbol={selectedSymbol}
            expiration={selectedExpiration}
            onOptionSelect={handleOptionSelect}
          />
        </div>
      </div>
      
      {/* Trade Modal */}
      {showTrade && selectedOption && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 rounded-xl shadow-xl w-full max-w-md border border-neutral-700 animate-fade-in">
            <div className="flex justify-between items-center p-4 border-b border-neutral-700">
              <h3 className="text-lg font-semibold">
                {isBuy ? 'Buy to Open' : 'Sell to Open'} {selectedOption.type.toUpperCase()}
              </h3>
              <button 
                onClick={() => setShowTrade(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="bg-warning-900 border border-warning-700 p-3 rounded-lg mb-4">
                <p className="text-warning-200 text-sm">
                  <strong>Educational Only:</strong> This is a simulation using real market data. 
                  OptionsWorld cannot execute actual trades.
                </p>
              </div>
              
              <div className="mb-4">
                <p className="mb-2">
                  <span className="text-neutral-400 text-sm">Symbol: </span>
                  <span className="font-medium">{selectedSymbol}</span>
                </p>
                <p className="mb-2">
                  <span className="text-neutral-400 text-sm">Contract: </span>
                  <span className="font-medium">
                    {selectedSymbol} {selectedOption.strike} {selectedOption.type.toUpperCase()} {formatDate(selectedOption.expiration)}
                  </span>
                </p>
                <p className="mb-2">
                  <span className="text-neutral-400 text-sm">Live Price: </span>
                  <span className="font-medium">{formatCurrency(selectedOption.ask)}/contract</span>
                </p>
                <p className="mb-2">
                  <span className="text-neutral-400 text-sm">Implied Volatility: </span>
                  <span className="font-medium">
                    {selectedOption.impliedVolatility ? `${(selectedOption.impliedVolatility * 100).toFixed(1)}%` : 'N/A'}
                  </span>
                </p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="quantity" className="block text-sm text-neutral-400 mb-1">
                  Quantity
                </label>
                <input 
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="input w-full"
                />
              </div>
              
              <div className="mb-6 bg-neutral-700 p-3 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-neutral-400">Total Cost:</span>
                  <span className="font-medium">
                    {formatCurrency(selectedOption.ask * quantity * 100)}
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-neutral-400">Contracts:</span>
                  <span>{quantity} × 100 shares</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-400">Commission:</span>
                  <span>{formatCurrency(0)}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  className="btn-ghost flex-1"
                  onClick={() => setShowTrade(false)}
                >
                  Close (Demo Only)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptionsChain;