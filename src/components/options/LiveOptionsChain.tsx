import React, { useState, useEffect } from 'react';
import { usePolygonData } from '../../hooks/usePolygonData';
import { formatCurrency, getProfitLossClass } from '../../utils/formatters';
import { ChevronRight, ChevronDown, Activity } from 'lucide-react';
import { PolygonOptionQuote } from '../../services/polygonService';

interface LiveOptionsChainProps {
  symbol: string;
  expiration?: string;
  onOptionSelect?: (option: PolygonOptionQuote, isBuy: boolean) => void;
}

const LiveOptionsChain: React.FC<LiveOptionsChainProps> = ({
  symbol,
  expiration,
  onOptionSelect
}) => {
  const { quote: stockQuote, options, loading, error } = usePolygonData({ 
    symbol, 
    includeOptions: true 
  });
  
  const [expandedStrikes, setExpandedStrikes] = useState<Record<number, boolean>>({});
  const [lastUpdates, setLastUpdates] = useState<Map<string, Date>>(new Map());

  useEffect(() => {
    // Track when each option was last updated
    options.forEach(option => {
      setLastUpdates(prev => new Map(prev.set(option.symbol, new Date())));
    });
  }, [options]);

  const toggleStrikeExpand = (strike: number) => {
    setExpandedStrikes(prev => ({
      ...prev,
      [strike]: !prev[strike]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Activity size={24} className="animate-spin text-primary-500 mr-3" />
        <span>Loading live options data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error-400 mb-2">Error loading options data</p>
        <p className="text-sm text-neutral-500">{error}</p>
      </div>
    );
  }

  // Group options by strike price
  const groupedOptions: Record<number, { call?: PolygonOptionQuote; put?: PolygonOptionQuote }> = {};
  
  options.forEach(option => {
    if (!expiration || option.expiration === expiration) {
      if (!groupedOptions[option.strike]) {
        groupedOptions[option.strike] = {};
      }
      groupedOptions[option.strike][option.type] = option;
    }
  });

  const strikes = Object.keys(groupedOptions).map(Number).sort((a, b) => a - b);
  const stockPrice = stockQuote?.last || 0;

  const isRecentlyUpdated = (optionSymbol: string) => {
    const lastUpdate = lastUpdates.get(optionSymbol);
    if (!lastUpdate) return false;
    return new Date().getTime() - lastUpdate.getTime() < 5000; // 5 seconds
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Live Options Chain - {symbol}</h3>
        <div className="flex items-center text-sm text-neutral-400">
          <div className="w-2 h-2 bg-success-400 rounded-full mr-2 animate-pulse"></div>
          Real-time via Polygon.io
        </div>
      </div>

      <table className="w-full min-w-max">
        <thead className="bg-neutral-800 sticky top-0 z-10">
          <tr className="text-xs border-b border-neutral-700">
            <th colSpan={6} className="py-3 text-center font-medium bg-neutral-750 border-r border-neutral-700">CALLS</th>
            <th className="py-3 px-4 text-center font-medium bg-neutral-700">STRIKE</th>
            <th colSpan={6} className="py-3 text-center font-medium bg-neutral-750 border-l border-neutral-700">PUTS</th>
          </tr>
          <tr className="text-xs text-neutral-400">
            <th className="py-2 px-3 text-left font-medium">Last</th>
            <th className="py-2 px-3 text-left font-medium">Bid</th>
            <th className="py-2 px-3 text-left font-medium">Ask</th>
            <th className="py-2 px-3 text-left font-medium">Volume</th>
            <th className="py-2 px-3 text-left font-medium">IV</th>
            <th className="py-2 px-3 text-left font-medium border-r border-neutral-700">Delta</th>
            <th className="py-2 px-4 text-center font-medium bg-neutral-700">Price</th>
            <th className="py-2 px-3 text-left font-medium border-l border-neutral-700">Delta</th>
            <th className="py-2 px-3 text-left font-medium">IV</th>
            <th className="py-2 px-3 text-left font-medium">Volume</th>
            <th className="py-2 px-3 text-left font-medium">Ask</th>
            <th className="py-2 px-3 text-left font-medium">Bid</th>
            <th className="py-2 px-3 text-left font-medium">Last</th>
          </tr>
        </thead>
        <tbody>
          {strikes.map((strike) => {
            const { call, put } = groupedOptions[strike];
            const isExpanded = expandedStrikes[strike];
            const isAtm = Math.abs(strike - stockPrice) < (stockPrice * 0.01);
            
            return (
              <React.Fragment key={strike}>
                <tr 
                  className={`border-b border-neutral-800 hover:bg-neutral-800/70 transition-colors cursor-pointer ${
                    isAtm ? 'bg-neutral-800/30' : ''
                  }`}
                  onClick={() => toggleStrikeExpand(strike)}
                >
                  {/* Call side */}
                  <td className={`py-3 px-3 ${call && isRecentlyUpdated(call.symbol) ? 'bg-success-500/10' : ''}`}>
                    {call ? formatCurrency(call.last) : '-'}
                  </td>
                  <td className="py-3 px-3">{call ? formatCurrency(call.bid) : '-'}</td>
                  <td className="py-3 px-3">{call ? formatCurrency(call.ask) : '-'}</td>
                  <td className="py-3 px-3">{call ? call.volume.toLocaleString() : '-'}</td>
                  <td className="py-3 px-3">
                    {call?.impliedVolatility ? `${(call.impliedVolatility * 100).toFixed(1)}%` : '-'}
                  </td>
                  <td className="py-3 px-3 border-r border-neutral-700">
                    {call?.delta ? call.delta.toFixed(3) : '-'}
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
                    {put?.delta ? put.delta.toFixed(3) : '-'}
                  </td>
                  <td className="py-3 px-3">
                    {put?.impliedVolatility ? `${(put.impliedVolatility * 100).toFixed(1)}%` : '-'}
                  </td>
                  <td className="py-3 px-3">{put ? put.volume.toLocaleString() : '-'}</td>
                  <td className="py-3 px-3">{put ? formatCurrency(put.ask) : '-'}</td>
                  <td className="py-3 px-3">{put ? formatCurrency(put.bid) : '-'}</td>
                  <td className={`py-3 px-3 ${put && isRecentlyUpdated(put.symbol) ? 'bg-success-500/10' : ''}`}>
                    {put ? formatCurrency(put.last) : '-'}
                  </td>
                </tr>
                
                {isExpanded && (
                  <tr className="bg-neutral-850 border-b border-neutral-800">
                    <td colSpan={13} className="p-3">
                      <div className="grid grid-cols-2 gap-4">
                        {call && (
                          <div className="bg-neutral-800 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium text-primary-300">CALL {strike}</h4>
                              <div className="flex items-center">
                                {isRecentlyUpdated(call.symbol) && (
                                  <div className="w-2 h-2 bg-success-400 rounded-full mr-2 animate-pulse"></div>
                                )}
                                <span className={call.last > call.strike ? 'text-success-400 text-sm' : 'text-neutral-400 text-sm'}>
                                  {call.last > call.strike ? 'In-The-Money' : 'Out-of-Money'}
                                </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                              <div className="flex flex-col">
                                <span className="text-neutral-400">Gamma</span>
                                <span>{call.gamma?.toFixed(4) || 'N/A'}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-neutral-400">Theta</span>
                                <span className={call.theta ? getProfitLossClass(call.theta) : ''}>
                                  {call.theta?.toFixed(4) || 'N/A'}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-neutral-400">Vega</span>
                                <span>{call.vega?.toFixed(4) || 'N/A'}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-neutral-400">Break Even</span>
                                <span>{formatCurrency(strike + call.ask)}</span>
                              </div>
                            </div>
                            {onOptionSelect && (
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
                            )}
                          </div>
                        )}
                        
                        {put && (
                          <div className="bg-neutral-800 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium text-primary-300">PUT {strike}</h4>
                              <div className="flex items-center">
                                {isRecentlyUpdated(put.symbol) && (
                                  <div className="w-2 h-2 bg-success-400 rounded-full mr-2 animate-pulse"></div>
                                )}
                                <span className={put.last > (strike - stockPrice) ? 'text-success-400 text-sm' : 'text-neutral-400 text-sm'}>
                                  {put.last > (strike - stockPrice) ? 'In-The-Money' : 'Out-of-Money'}
                                </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                              <div className="flex flex-col">
                                <span className="text-neutral-400">Gamma</span>
                                <span>{put.gamma?.toFixed(4) || 'N/A'}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-neutral-400">Theta</span>
                                <span className={put.theta ? getProfitLossClass(put.theta) : ''}>
                                  {put.theta?.toFixed(4) || 'N/A'}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-neutral-400">Vega</span>
                                <span>{put.vega?.toFixed(4) || 'N/A'}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-neutral-400">Break Even</span>
                                <span>{formatCurrency(strike - put.ask)}</span>
                              </div>
                            </div>
                            {onOptionSelect && (
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
                            )}
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

export default LiveOptionsChain;