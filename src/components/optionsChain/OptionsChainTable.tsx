import React, { useState } from 'react';
import { Option } from '../../types';
import { formatCurrency, getProfitLossClass } from '../../utils/formatters';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface OptionsChainTableProps {
  calls: Option[];
  puts: Option[];
  stockPrice: number;
  selectedExpiration: string;
  onOptionSelect: (option: Option, isBuy: boolean) => void;
}

const OptionsChainTable: React.FC<OptionsChainTableProps> = ({
  calls,
  puts,
  stockPrice,
  selectedExpiration,
  onOptionSelect
}) => {
  const [expandedStrikes, setExpandedStrikes] = useState<Record<number, boolean>>({});
  
  // Group options by strike price
  const groupedByStrike: Record<number, { call?: Option; put?: Option }> = {};
  
  calls.forEach(call => {
    if (call.expiration === selectedExpiration) {
      if (!groupedByStrike[call.strike]) {
        groupedByStrike[call.strike] = {};
      }
      groupedByStrike[call.strike].call = call;
    }
  });
  
  puts.forEach(put => {
    if (put.expiration === selectedExpiration) {
      if (!groupedByStrike[put.strike]) {
        groupedByStrike[put.strike] = {};
      }
      groupedByStrike[put.strike].put = put;
    }
  });
  
  const strikes = Object.keys(groupedByStrike).map(Number).sort((a, b) => a - b);
  
  const toggleStrikeExpand = (strike: number) => {
    setExpandedStrikes(prev => ({
      ...prev,
      [strike]: !prev[strike]
    }));
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-max">
        <thead className="bg-neutral-800 sticky top-0 z-10">
          <tr className="text-xs border-b border-neutral-700">
            <th colSpan={5} className="py-3 text-center font-medium bg-neutral-750 border-r border-neutral-700">CALLS</th>
            <th className="py-3 px-4 text-center font-medium bg-neutral-700">STRIKE</th>
            <th colSpan={5} className="py-3 text-center font-medium bg-neutral-750 border-l border-neutral-700">PUTS</th>
          </tr>
          <tr className="text-xs text-neutral-400">
            <th className="py-2 px-3 text-left font-medium">Last</th>
            <th className="py-2 px-3 text-left font-medium">Bid</th>
            <th className="py-2 px-3 text-left font-medium">Ask</th>
            <th className="py-2 px-3 text-left font-medium">Volume</th>
            <th className="py-2 px-3 text-left font-medium border-r border-neutral-700">IV</th>
            <th className="py-2 px-4 text-center font-medium bg-neutral-700">Price</th>
            <th className="py-2 px-3 text-left font-medium border-l border-neutral-700">IV</th>
            <th className="py-2 px-3 text-left font-medium">Volume</th>
            <th className="py-2 px-3 text-left font-medium">Ask</th>
            <th className="py-2 px-3 text-left font-medium">Bid</th>
            <th className="py-2 px-3 text-left font-medium">Last</th>
          </tr>
        </thead>
        <tbody>
          {strikes.map((strike) => {
            const { call, put } = groupedByStrike[strike];
            const isExpanded = expandedStrikes[strike];
            const isAtm = Math.abs(strike - stockPrice) < (stockPrice * 0.01); // Within 1% of current price
            
            return (
              <React.Fragment key={strike}>
                <tr 
                  className={`border-b border-neutral-800 hover:bg-neutral-800/70 transition-colors ${
                    isAtm ? 'bg-neutral-800/30' : ''
                  }`}
                  onClick={() => toggleStrikeExpand(strike)}
                >
                  {/* Call side */}
                  <td className="py-3 px-3">{call ? formatCurrency(call.last) : '-'}</td>
                  <td className="py-3 px-3">{call ? formatCurrency(call.bid) : '-'}</td>
                  <td className="py-3 px-3">{call ? formatCurrency(call.ask) : '-'}</td>
                  <td className="py-3 px-3">{call ? call.volume.toLocaleString() : '-'}</td>
                  <td className="py-3 px-3 border-r border-neutral-700">
                    {call ? `${(call.impliedVolatility * 100).toFixed(1)}%` : '-'}
                  </td>
                  
                  {/* Strike price column */}
                  <td 
                    className={`py-3 px-4 text-center font-semibold ${
                      isAtm ? 'bg-primary-900/30 text-primary-300' : 'bg-neutral-750'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      {isExpanded ? <ChevronDown size={16} className="mr-1" /> : <ChevronRight size={16} className="mr-1" />}
                      {formatCurrency(strike)}
                    </div>
                  </td>
                  
                  {/* Put side */}
                  <td className="py-3 px-3 border-l border-neutral-700">
                    {put ? `${(put.impliedVolatility * 100).toFixed(1)}%` : '-'}
                  </td>
                  <td className="py-3 px-3">{put ? put.volume.toLocaleString() : '-'}</td>
                  <td className="py-3 px-3">{put ? formatCurrency(put.ask) : '-'}</td>
                  <td className="py-3 px-3">{put ? formatCurrency(put.bid) : '-'}</td>
                  <td className="py-3 px-3">{put ? formatCurrency(put.last) : '-'}</td>
                </tr>
                
                {isExpanded && (
                  <tr className="bg-neutral-850 border-b border-neutral-800">
                    <td colSpan={11} className="p-3">
                      <div className="grid grid-cols-2 gap-4">
                        {call && (
                          <div className="bg-neutral-800 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium text-primary-300">CALL {strike}</h4>
                              <span className={call.inTheMoney ? 'text-success-400 text-sm' : 'text-neutral-400 text-sm'}>
                                {call.inTheMoney ? 'In-The-Money' : 'Out-of-Money'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                              <div className="flex flex-col">
                                <span className="text-neutral-400">Open Interest</span>
                                <span>{call.openInterest.toLocaleString()}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-neutral-400">Bid-Ask Spread</span>
                                <span>{formatCurrency(call.ask - call.bid)}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-neutral-400">Break Even</span>
                                <span>{formatCurrency(strike + call.ask)}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-neutral-400">Daily Change</span>
                                <span className={getProfitLossClass(call.change)}>
                                  {call.change > 0 ? '+' : ''}{call.change.toFixed(2)}%
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                className="btn-success flex-1 py-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOptionSelect(call, true);
                                }}
                              >
                                Buy
                              </button>
                              <button 
                                className="btn-error flex-1 py-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOptionSelect(call, false);
                                }}
                              >
                                Sell
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {put && (
                          <div className="bg-neutral-800 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium text-primary-300">PUT {strike}</h4>
                              <span className={put.inTheMoney ? 'text-success-400 text-sm' : 'text-neutral-400 text-sm'}>
                                {put.inTheMoney ? 'In-The-Money' : 'Out-of-Money'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                              <div className="flex flex-col">
                                <span className="text-neutral-400">Open Interest</span>
                                <span>{put.openInterest.toLocaleString()}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-neutral-400">Bid-Ask Spread</span>
                                <span>{formatCurrency(put.ask - put.bid)}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-neutral-400">Break Even</span>
                                <span>{formatCurrency(strike - put.ask)}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-neutral-400">Daily Change</span>
                                <span className={getProfitLossClass(put.change)}>
                                  {put.change > 0 ? '+' : ''}{put.change.toFixed(2)}%
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                className="btn-success flex-1 py-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOptionSelect(put, true);
                                }}
                              >
                                Buy
                              </button>
                              <button 
                                className="btn-error flex-1 py-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOptionSelect(put, false);
                                }}
                              >
                                Sell
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OptionsChainTable;