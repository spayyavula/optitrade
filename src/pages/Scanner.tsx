import React, { useState, useEffect } from 'react';
import { mockOptionsChain, mockStocks } from '../data/mockData';
import { blackScholes } from '../utils/blackScholes';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { Search, ArrowUpDown, RefreshCw } from 'lucide-react';

interface ArbitrageOpportunity {
  symbol: string;
  strike: number;
  expiration: string;
  callPrice: number;
  putPrice: number;
  stockPrice: number;
  difference: number;
  volume: number;
  strategy: string;
}

const Scanner: React.FC = () => {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<keyof ArbitrageOpportunity>('difference');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [minVolume, setMinVolume] = useState(1000);

  const findArbitrageOpportunities = () => {
    setLoading(true);
    const newOpportunities: ArbitrageOpportunity[] = [];
    const riskFreeRate = 0.05; // 5% risk-free rate

    // Analyze each option chain
    mockOptionsChain.expirations.forEach(expiration => {
      const daysToExpiry = Math.floor((new Date(expiration).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      const T = daysToExpiry / 365; // Time in years

      mockOptionsChain.calls.forEach((call, index) => {
        if (call.expiration === expiration) {
          const put = mockOptionsChain.puts[index];
          const stockPrice = mockStocks[0].price;

          if (put && call.volume >= minVolume && put.volume >= minVolume) {
            const arbitrage = blackScholes.findArbitrageOpportunity(
              call.last,
              put.last,
              stockPrice,
              call.strike,
              riskFreeRate,
              T
            );

            if (arbitrage.hasArbitrage) {
              newOpportunities.push({
                symbol: mockOptionsChain.symbol,
                strike: call.strike,
                expiration,
                callPrice: call.last,
                putPrice: put.last,
                stockPrice,
                difference: arbitrage.difference,
                volume: Math.min(call.volume, put.volume),
                strategy: arbitrage.strategy
              });
            }
          }
        }
      });
    });

    setOpportunities(newOpportunities);
    setLoading(false);
  };

  useEffect(() => {
    findArbitrageOpportunities();
  }, [minVolume]);

  const sortOpportunities = (field: keyof ArbitrageOpportunity) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedOpportunities = [...opportunities].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const direction = sortDirection === 'asc' ? 1 : -1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * direction;
    }
    return ((aValue as number) - (bValue as number)) * direction;
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Market Scanner</h1>
          <button 
            className="btn-primary flex items-center"
            onClick={findArbitrageOpportunities}
          >
            <RefreshCw size={18} className="mr-2" />
            Refresh
          </button>
        </div>

        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center">
              <Search size={20} className="text-neutral-400 mr-2" />
              <h2 className="text-xl font-semibold">Arbitrage Opportunities</h2>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-neutral-700 rounded-lg px-3 py-2">
                <span className="text-sm text-neutral-300 mr-2">Min Volume:</span>
                <select
                  value={minVolume}
                  onChange={(e) => setMinVolume(Number(e.target.value))}
                  className="bg-transparent border-none text-sm focus:outline-none"
                >
                  <option value="100">100</option>
                  <option value="500">500</option>
                  <option value="1000">1,000</option>
                  <option value="5000">5,000</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : sortedOpportunities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-400 mb-2">No arbitrage opportunities found</p>
              <p className="text-sm text-neutral-500">Try adjusting the minimum volume or refresh the scanner</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-left text-neutral-400 border-b border-neutral-700">
                  <tr>
                    <th 
                      className="pb-3 font-medium cursor-pointer"
                      onClick={() => sortOpportunities('symbol')}
                    >
                      <div className="flex items-center">
                        Symbol
                        <ArrowUpDown size={14} className="ml-1" />
                      </div>
                    </th>
                    <th 
                      className="pb-3 font-medium cursor-pointer"
                      onClick={() => sortOpportunities('strike')}
                    >
                      <div className="flex items-center">
                        Strike
                        <ArrowUpDown size={14} className="ml-1" />
                      </div>
                    </th>
                    <th 
                      className="pb-3 font-medium cursor-pointer"
                      onClick={() => sortOpportunities('expiration')}
                    >
                      <div className="flex items-center">
                        Expiration
                        <ArrowUpDown size={14} className="ml-1" />
                      </div>
                    </th>
                    <th className="pb-3 font-medium">Call</th>
                    <th className="pb-3 font-medium">Put</th>
                    <th className="pb-3 font-medium">Stock</th>
                    <th 
                      className="pb-3 font-medium cursor-pointer"
                      onClick={() => sortOpportunities('difference')}
                    >
                      <div className="flex items-center">
                        Difference
                        <ArrowUpDown size={14} className="ml-1" />
                      </div>
                    </th>
                    <th 
                      className="pb-3 font-medium cursor-pointer"
                      onClick={() => sortOpportunities('volume')}
                    >
                      <div className="flex items-center">
                        Volume
                        <ArrowUpDown size={14} className="ml-1" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedOpportunities.map((opportunity, index) => (
                    <tr 
                      key={index}
                      className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors"
                    >
                      <td className="py-4 font-medium">{opportunity.symbol}</td>
                      <td className="py-4">{formatCurrency(opportunity.strike)}</td>
                      <td className="py-4">
                        {new Date(opportunity.expiration).toLocaleDateString()}
                      </td>
                      <td className="py-4">{formatCurrency(opportunity.callPrice)}</td>
                      <td className="py-4">{formatCurrency(opportunity.putPrice)}</td>
                      <td className="py-4">{formatCurrency(opportunity.stockPrice)}</td>
                      <td className="py-4">
                        <span className={opportunity.difference > 0 ? 'text-success-400' : 'text-error-400'}>
                          {formatCurrency(Math.abs(opportunity.difference))}
                        </span>
                      </td>
                      <td className="py-4">{opportunity.volume.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Understanding Arbitrage Opportunities</h3>
          <div className="space-y-4 text-sm">
            <p>
              The scanner uses the Black-Scholes model and put-call parity to identify potential arbitrage opportunities 
              in the options market. Here's how to interpret the results:
            </p>
            <ul className="list-disc pl-4 space-y-2">
              <li>
                <strong>Positive Difference:</strong> Indicates an opportunity to profit by selling the call, 
                buying the put, buying the stock, and borrowing the present value of the strike price.
              </li>
              <li>
                <strong>Negative Difference:</strong> Indicates an opportunity to profit by buying the call, 
                selling the put, selling the stock, and lending the present value of the strike price.
              </li>
              <li>
                <strong>Volume Filter:</strong> Higher volume requirements help ensure the opportunities 
                are actually tradeable in practice.
              </li>
            </ul>
            <p className="text-warning-400">
              Note: Transaction costs, bid-ask spreads, and other market frictions may make some opportunities 
              unprofitable in practice. Always conduct your own due diligence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scanner;