import React, { useState } from 'react';
import { mockStocks } from '../../data/mockData';
import { formatCurrency, formatCompactNumber, getProfitLossClass } from '../../utils/formatters';

const MarketOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers' | 'most-active'>('most-active');

  const gainers = [...mockStocks].sort((a, b) => b.percentChange - a.percentChange).slice(0, 5);
  const losers = [...mockStocks].sort((a, b) => a.percentChange - b.percentChange).slice(0, 5);
  const mostActive = [...mockStocks].sort((a, b) => b.volume - a.volume).slice(0, 5);

  const displayStocks = activeTab === 'gainers' 
    ? gainers 
    : activeTab === 'losers' 
      ? losers 
      : mostActive;

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Market Overview</h2>
        <div className="text-sm font-medium text-neutral-400">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="flex space-x-1 mb-4 bg-neutral-700 p-1 rounded-lg">
        <button 
          onClick={() => setActiveTab('most-active')}
          className={`text-sm flex-1 py-2 px-3 rounded-md transition-colors ${
            activeTab === 'most-active' 
              ? 'bg-neutral-600 text-white' 
              : 'text-neutral-400 hover:bg-neutral-600/50'
          }`}
        >
          Most Active
        </button>
        <button 
          onClick={() => setActiveTab('gainers')}
          className={`text-sm flex-1 py-2 px-3 rounded-md transition-colors ${
            activeTab === 'gainers' 
              ? 'bg-neutral-600 text-white' 
              : 'text-neutral-400 hover:bg-neutral-600/50'
          }`}
        >
          Top Gainers
        </button>
        <button 
          onClick={() => setActiveTab('losers')}
          className={`text-sm flex-1 py-2 px-3 rounded-md transition-colors ${
            activeTab === 'losers' 
              ? 'bg-neutral-600 text-white' 
              : 'text-neutral-400 hover:bg-neutral-600/50'
          }`}
        >
          Top Losers
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="text-left text-neutral-400 border-b border-neutral-700">
            <tr>
              <th className="pb-3 font-medium">Symbol</th>
              <th className="pb-3 font-medium">Price</th>
              <th className="pb-3 font-medium">Change</th>
              <th className="pb-3 font-medium text-right">Volume</th>
            </tr>
          </thead>
          <tbody>
            {displayStocks.map((stock) => (
              <tr key={stock.symbol} className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                <td className="py-4 font-medium">
                  <div className="flex flex-col">
                    <span>{stock.symbol}</span>
                    <span className="text-xs text-neutral-400">{stock.name}</span>
                  </div>
                </td>
                <td className="py-4">{formatCurrency(stock.price)}</td>
                <td className={`py-4 ${getProfitLossClass(stock.percentChange)}`}>
                  {stock.percentChange > 0 ? '+' : ''}{stock.percentChange.toFixed(2)}%
                </td>
                <td className="py-4 text-right">{formatCompactNumber(stock.volume)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketOverview;