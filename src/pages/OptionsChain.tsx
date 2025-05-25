import React, { useState } from 'react';
import StockPrice from '../components/common/StockPrice';
import PriceChart from '../components/common/PriceChart';
import OptionsChainTable from '../components/optionsChain/OptionsChainTable';
import { mockOptionsChain, mockAAPLData, mockStocks } from '../data/mockData';
import { Option } from '../types';
import { AlertCircle } from 'lucide-react';

const OptionsChain: React.FC = () => {
  const [selectedExpiration, setSelectedExpiration] = useState(mockOptionsChain.expirations[0]);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [isBuy, setIsBuy] = useState(true);
  const [showTrade, setShowTrade] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  const appleStock = mockStocks.find(stock => stock.symbol === 'AAPL');
  
  const handleOptionSelect = (option: Option, buy: boolean) => {
    setSelectedOption(option);
    setIsBuy(buy);
    setShowTrade(true);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">Options Chain</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 card">
            <div className="mb-4 flex justify-between items-center">
              <div>
                {appleStock && (
                  <StockPrice 
                    symbol={appleStock.symbol}
                    price={appleStock.price}
                    change={appleStock.change}
                    percentChange={appleStock.percentChange}
                    animated
                  />
                )}
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
            <h3 className="text-lg font-semibold mb-4">Company Information</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm text-neutral-400 mb-1">Apple Inc. (AAPL)</h4>
                <p className="text-sm">
                  Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, 
                  wearables, and accessories worldwide. The company offers iPhone, Mac, iPad, and wearables, 
                  home, and accessories.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <h4 className="text-xs text-neutral-400">Market Cap</h4>
                  <p className="font-medium">$2.78T</p>
                </div>
                <div>
                  <h4 className="text-xs text-neutral-400">P/E Ratio</h4>
                  <p className="font-medium">29.2</p>
                </div>
                <div>
                  <h4 className="text-xs text-neutral-400">52-Week High</h4>
                  <p className="font-medium">$198.23</p>
                </div>
                <div>
                  <h4 className="text-xs text-neutral-400">52-Week Low</h4>
                  <p className="font-medium">$142.18</p>
                </div>
                <div>
                  <h4 className="text-xs text-neutral-400">Average Volume</h4>
                  <p className="font-medium">60.2M</p>
                </div>
                <div>
                  <h4 className="text-xs text-neutral-400">Dividend Yield</h4>
                  <p className="font-medium">0.51%</p>
                </div>
              </div>
              
              <div className="pt-3 border-t border-neutral-700">
                <h4 className="text-sm font-medium mb-2">Upcoming Events</h4>
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-neutral-300">Earnings</span>
                    <span>Jul 25, 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-300">Ex-Dividend</span>
                    <span>Aug 12, 2025</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-xl font-semibold">Options Chain - {mockOptionsChain.symbol}</h3>
            
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center bg-neutral-800 rounded-lg overflow-hidden">
                <span className="text-sm text-neutral-400 px-3">Expiration:</span>
                <select 
                  value={selectedExpiration}
                  onChange={(e) => setSelectedExpiration(e.target.value)}
                  className="select bg-transparent border-none text-sm py-2"
                >
                  {mockOptionsChain.expirations.map(date => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString()} ({Math.floor((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}d)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-750 border border-neutral-700 p-3 rounded-lg mb-4 flex items-center">
            <AlertCircle size={20} className="text-primary-400 mr-2" />
            <p className="text-sm">
              Click on any option row to see more details and trading actions. Options shown are for educational purposes only.
            </p>
          </div>
          
          <OptionsChainTable 
            calls={mockOptionsChain.calls}
            puts={mockOptionsChain.puts}
            stockPrice={appleStock?.price || 0}
            selectedExpiration={selectedExpiration}
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
              <div className="mb-4">
                <p className="mb-2">
                  <span className="text-neutral-400 text-sm">Symbol: </span>
                  <span className="font-medium">{mockOptionsChain.symbol}</span>
                </p>
                <p className="mb-2">
                  <span className="text-neutral-400 text-sm">Contract: </span>
                  <span className="font-medium">
                    {mockOptionsChain.symbol} {selectedOption.strike} {selectedOption.type.toUpperCase()} {formatDate(selectedOption.expiration)}
                  </span>
                </p>
                <p className="mb-2">
                  <span className="text-neutral-400 text-sm">Price: </span>
                  <span className="font-medium">{formatCurrency(selectedOption.ask)}/contract</span>
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
                  className={`flex-1 py-2 rounded-lg font-medium ${
                    isBuy ? 'bg-success-600 hover:bg-success-700 text-white' : 'bg-error-600 hover:bg-error-700 text-white'
                  }`}
                >
                  {isBuy ? 'Buy' : 'Sell'} {quantity} Contract{quantity > 1 ? 's' : ''}
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => setShowTrade(false)}
                >
                  Cancel
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