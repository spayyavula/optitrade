import React, { useState } from 'react';
import { mockWatchlist } from '../data/mockData';
import { formatCurrency, getProfitLossClass } from '../utils/formatters';
import { Plus, Trash2, Star, StarOff, MoreVertical, X } from 'lucide-react';
import StockPrice from '../components/common/StockPrice';

const Watchlist: React.FC = () => {
  const [watchlist, setWatchlist] = useState(mockWatchlist);
  const [showAddSymbol, setShowAddSymbol] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');

  const addToWatchlist = () => {
    if (newSymbol && !watchlist.find(item => item.symbol === newSymbol.toUpperCase())) {
      // In a real app, this would fetch the stock data from an API
      setWatchlist([
        ...watchlist,
        {
          symbol: newSymbol.toUpperCase(),
          name: `${newSymbol.toUpperCase()} Corp`,
          price: 100 + Math.random() * 200,
          change: (Math.random() * 6) - 3,
          percentChange: (Math.random() * 3) - 1.5,
        }
      ]);
    }
    
    setNewSymbol('');
    setShowAddSymbol(false);
  };
  
  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter(item => item.symbol !== symbol));
  };
  
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Watchlist</h1>
          <button 
            className="btn-primary flex items-center"
            onClick={() => setShowAddSymbol(true)}
          >
            <Plus size={18} className="mr-2" />
            Add Symbol
          </button>
        </div>
        
        <div className="card">
          {watchlist.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-400 mb-3">Your watchlist is empty</p>
              <button 
                className="btn-primary"
                onClick={() => setShowAddSymbol(true)}
              >
                Add Symbols
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-left text-neutral-400 border-b border-neutral-700">
                  <tr>
                    <th className="pb-3 font-medium">Symbol</th>
                    <th className="pb-3 font-medium">Price</th>
                    <th className="pb-3 font-medium">Change</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {watchlist.map((item) => (
                    <tr 
                      key={item.symbol} 
                      className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors"
                    >
                      <td className="py-4 font-medium">
                        <div className="flex items-center">
                          <Star size={16} className="text-primary-400 mr-2" />
                          <div className="flex flex-col">
                            <span>{item.symbol}</span>
                            <span className="text-xs text-neutral-400">{item.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        {formatCurrency(item.price)}
                      </td>
                      <td className={`py-4 ${getProfitLossClass(item.percentChange)}`}>
                        <div>
                          {item.percentChange > 0 ? '+' : ''}{item.percentChange.toFixed(2)}%
                        </div>
                        <div className="text-xs">
                          {item.change > 0 ? '+' : ''}{formatCurrency(item.change)}
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button 
                            className="btn-ghost p-2 rounded-full"
                            onClick={() => removeFromWatchlist(item.symbol)}
                          >
                            <Trash2 size={16} />
                          </button>
                          <button className="btn-ghost p-2 rounded-full">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlist.slice(0, 3).map(item => (
            <div key={`detail-${item.symbol}`} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <StockPrice
                    symbol={item.symbol}
                    price={item.price}
                    change={item.change}
                    percentChange={item.percentChange}
                  />
                  <p className="text-sm text-neutral-400 mt-1">{item.name}</p>
                </div>
                <div className="flex">
                  <button className="btn-ghost p-1 rounded-full">
                    <StarOff size={18} className="text-neutral-400 hover:text-primary-400" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <button className="btn-success py-1.5 text-sm">Trade Options</button>
                <button className="btn-ghost py-1.5 text-sm">View Chart</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Add Symbol Modal */}
      {showAddSymbol && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 rounded-xl shadow-xl w-full max-w-md border border-neutral-700 animate-fade-in">
            <div className="flex justify-between items-center p-4 border-b border-neutral-700">
              <h3 className="text-lg font-semibold">Add Symbol to Watchlist</h3>
              <button 
                onClick={() => setShowAddSymbol(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <label htmlFor="symbol" className="block text-sm text-neutral-400 mb-1">
                  Symbol
                </label>
                <input 
                  id="symbol"
                  type="text"
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                  placeholder="e.g., AAPL"
                  className="input w-full"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  className="btn-primary flex-1"
                  onClick={addToWatchlist}
                  disabled={!newSymbol}
                >
                  Add to Watchlist
                </button>
                <button
                  className="btn-ghost flex-1"
                  onClick={() => setShowAddSymbol(false)}
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

export default Watchlist;