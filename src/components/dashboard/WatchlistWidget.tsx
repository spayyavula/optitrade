import React from 'react';
import { Eye, Plus } from 'lucide-react';
import { mockWatchlist } from '../../data/mockData';
import { formatCurrency, getProfitLossClass } from '../../utils/formatters';

const WatchlistWidget: React.FC = () => {
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Eye size={18} className="text-primary-400 mr-2" />
          <h2 className="text-xl font-semibold">Watchlist</h2>
        </div>
        <button className="btn-ghost p-1 rounded-full">
          <Plus size={18} />
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="text-left text-neutral-400 border-b border-neutral-700">
            <tr>
              <th className="pb-3 font-medium">Symbol</th>
              <th className="pb-3 font-medium">Price</th>
              <th className="pb-3 font-medium text-right">Change</th>
            </tr>
          </thead>
          <tbody>
            {mockWatchlist.map((item) => (
              <tr 
                key={item.symbol} 
                className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors cursor-pointer"
              >
                <td className="py-3 font-medium">
                  <div className="flex flex-col">
                    <span>{item.symbol}</span>
                    <span className="text-xs text-neutral-400">{item.name}</span>
                  </div>
                </td>
                <td className="py-3">{formatCurrency(item.price)}</td>
                <td className={`py-3 text-right ${getProfitLossClass(item.percentChange)}`}>
                  <div>
                    {item.percentChange > 0 ? '+' : ''}{item.percentChange.toFixed(2)}%
                  </div>
                  <div className="text-xs">
                    {item.change > 0 ? '+' : ''}{formatCurrency(item.change)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-3 pt-3 border-t border-neutral-800">
        <button className="w-full text-center text-primary-400 hover:text-primary-300 text-sm py-1">
          View Full Watchlist
        </button>
      </div>
    </div>
  );
};

export default WatchlistWidget;