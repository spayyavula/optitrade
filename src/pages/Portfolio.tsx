import React, { useState } from 'react';
import PositionsList from '../components/portfolio/PositionsList';
import { mockPositions, mockAAPLData } from '../data/mockData';
import { Position } from '../types';
import PriceChart from '../components/common/PriceChart';
import { X } from 'lucide-react';
import { formatCurrency, formatDate, formatWithSign, getProfitLossClass } from '../utils/formatters';

const Portfolio: React.FC = () => {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">Portfolio</h1>
        
        <PositionsList 
          positions={mockPositions} 
          onViewPosition={setSelectedPosition}
        />
      </div>
      
      {/* Position Detail Modal */}
      {selectedPosition && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 rounded-xl shadow-xl w-full max-w-4xl border border-neutral-700 animate-fade-in">
            <div className="flex justify-between items-center p-4 border-b border-neutral-700">
              <h3 className="text-lg font-semibold">
                {selectedPosition.symbol} {selectedPosition.type !== 'stock' && (
                  <span>
                    {selectedPosition.strike} {selectedPosition.type.toUpperCase()} {selectedPosition.expiration && formatDate(selectedPosition.expiration)}
                  </span>
                )}
              </h3>
              <button 
                onClick={() => setSelectedPosition(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-neutral-750 p-3 rounded-lg">
                      <span className="text-sm text-neutral-400">Quantity</span>
                      <p className="text-xl font-medium">{selectedPosition.quantity}</p>
                    </div>
                    <div className="bg-neutral-750 p-3 rounded-lg">
                      <span className="text-sm text-neutral-400">Current Value</span>
                      <p className="text-xl font-medium">
                        {formatCurrency(selectedPosition.currentPrice * selectedPosition.quantity)}
                      </p>
                    </div>
                    <div className="bg-neutral-750 p-3 rounded-lg">
                      <span className="text-sm text-neutral-400">Average Cost</span>
                      <p className="text-xl font-medium">
                        {formatCurrency(selectedPosition.averagePrice)}
                      </p>
                    </div>
                    <div className="bg-neutral-750 p-3 rounded-lg">
                      <span className="text-sm text-neutral-400">Current Price</span>
                      <p className="text-xl font-medium">
                        {formatCurrency(selectedPosition.currentPrice)}
                      </p>
                    </div>
                    <div className="bg-neutral-750 p-3 rounded-lg col-span-2">
                      <span className="text-sm text-neutral-400">Total Gain/Loss</span>
                      <div className="flex items-baseline">
                        <p className={`text-xl font-medium ${getProfitLossClass(selectedPosition.profitLoss)}`}>
                          {formatWithSign(selectedPosition.profitLoss)}
                        </p>
                        <span className={`ml-1 ${getProfitLossClass(selectedPosition.profitLoss)}`}>
                          ({formatWithSign(selectedPosition.profitLossPercent)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedPosition.type !== 'stock' && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-3">Options Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-neutral-750 p-3 rounded-lg">
                          <span className="text-sm text-neutral-400">Strike Price</span>
                          <p className="font-medium">{formatCurrency(selectedPosition.strike || 0)}</p>
                        </div>
                        <div className="bg-neutral-750 p-3 rounded-lg">
                          <span className="text-sm text-neutral-400">Expiration</span>
                          <p className="font-medium">
                            {selectedPosition.expiration && formatDate(selectedPosition.expiration)}
                          </p>
                        </div>
                        <div className="bg-neutral-750 p-3 rounded-lg">
                          <span className="text-sm text-neutral-400">Type</span>
                          <p className="font-medium capitalize">{selectedPosition.type}</p>
                        </div>
                        <div className="bg-neutral-750 p-3 rounded-lg">
                          <span className="text-sm text-neutral-400">Days to Expiry</span>
                          <p className="font-medium">
                            {selectedPosition.expiration && 
                              Math.floor((new Date(selectedPosition.expiration).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <button className="btn-error flex-1">
                      {selectedPosition.type === 'stock' ? 'Sell Shares' : 'Close Position'}
                    </button>
                    <button className="btn-ghost flex-1">
                      Set Alert
                    </button>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Price History</h4>
                  <PriceChart data={mockAAPLData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;