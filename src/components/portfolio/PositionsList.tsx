import React, { useState } from 'react';
import { Position } from '../../types';
import { formatCurrency, formatWithSign, getProfitLossClass } from '../../utils/formatters';
import { TrendingUp, TrendingDown, Eye } from 'lucide-react';

interface PositionsListProps {
  positions: Position[];
  onViewPosition: (position: Position) => void;
}

const PositionsList: React.FC<PositionsListProps> = ({ positions, onViewPosition }) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Position | null,
    direction: 'ascending' | 'descending'
  }>({
    key: null,
    direction: 'ascending'
  });

  const [filter, setFilter] = useState<'all' | 'options' | 'stocks'>('all');

  const sortedPositions = [...positions].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const valueA = a[sortConfig.key];
    const valueB = b[sortConfig.key];
    
    if (valueA === undefined || valueB === undefined) return 0;
    
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortConfig.direction === 'ascending'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return sortConfig.direction === 'ascending'
        ? valueA - valueB
        : valueB - valueA;
    }
    
    return 0;
  });

  const filteredPositions = sortedPositions.filter(position => {
    if (filter === 'all') return true;
    if (filter === 'options') return position.type === 'call' || position.type === 'put';
    if (filter === 'stocks') return position.type === 'stock';
    return true;
  });

  const requestSort = (key: keyof Position) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'ascending' 
        ? 'descending' 
        : 'ascending'
    });
  };

  const getTotalValue = () => {
    return positions.reduce((total, position) => {
      return total + position.currentPrice * position.quantity;
    }, 0);
  };

  const getTotalProfitLoss = () => {
    return positions.reduce((total, position) => {
      return total + position.profitLoss;
    }, 0);
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Positions</h2>
        <div className="flex space-x-1 bg-neutral-700 p-1 rounded-lg">
          <button 
            onClick={() => setFilter('all')}
            className={`text-sm py-1 px-3 rounded-md transition-colors ${
              filter === 'all' 
                ? 'bg-neutral-600 text-white' 
                : 'text-neutral-400 hover:bg-neutral-600/50'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('options')}
            className={`text-sm py-1 px-3 rounded-md transition-colors ${
              filter === 'options' 
                ? 'bg-neutral-600 text-white' 
                : 'text-neutral-400 hover:bg-neutral-600/50'
            }`}
          >
            Options
          </button>
          <button 
            onClick={() => setFilter('stocks')}
            className={`text-sm py-1 px-3 rounded-md transition-colors ${
              filter === 'stocks' 
                ? 'bg-neutral-600 text-white' 
                : 'text-neutral-400 hover:bg-neutral-600/50'
            }`}
          >
            Stocks
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-neutral-750 p-3 rounded-lg">
          <span className="text-sm text-neutral-400">Total Positions</span>
          <p className="text-xl font-medium">{positions.length}</p>
        </div>
        <div className="bg-neutral-750 p-3 rounded-lg">
          <span className="text-sm text-neutral-400">Total Value</span>
          <p className="text-xl font-medium">{formatCurrency(getTotalValue())}</p>
        </div>
        <div className="bg-neutral-750 p-3 rounded-lg">
          <span className="text-sm text-neutral-400">Today's Change</span>
          <div className="flex items-baseline">
            <p className={`text-xl font-medium ${getProfitLossClass(getTotalProfitLoss())}`}>
              {formatWithSign(getTotalProfitLoss())}
            </p>
            <span className={`ml-1 ${getProfitLossClass(getTotalProfitLoss())}`}>
              ({formatWithSign(getTotalProfitLoss() / getTotalValue() * 100)}%)
            </span>
          </div>
        </div>
        <div className="bg-neutral-750 p-3 rounded-lg">
          <span className="text-sm text-neutral-400">Portfolio Allocation</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-2 flex-grow bg-neutral-700 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500" style={{ width: '65%' }}></div>
            </div>
            <span className="text-sm">65%</span>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="text-left text-neutral-400 border-b border-neutral-700">
            <tr>
              <th 
                className="pb-3 font-medium cursor-pointer"
                onClick={() => requestSort('symbol')}
              >
                Symbol
              </th>
              <th 
                className="pb-3 font-medium cursor-pointer"
                onClick={() => requestSort('type')}
              >
                Type
              </th>
              <th 
                className="pb-3 font-medium cursor-pointer"
                onClick={() => requestSort('quantity')}
              >
                Quantity
              </th>
              <th 
                className="pb-3 font-medium cursor-pointer"
                onClick={() => requestSort('averagePrice')}
              >
                Avg Price
              </th>
              <th 
                className="pb-3 font-medium cursor-pointer"
                onClick={() => requestSort('currentPrice')}
              >
                Current Price
              </th>
              <th 
                className="pb-3 font-medium cursor-pointer text-right"
                onClick={() => requestSort('profitLoss')}
              >
                P/L
              </th>
              <th className="pb-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filteredPositions.map((position) => (
              <tr key={position.id} className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                <td className="py-4 font-medium">
                  {position.symbol}
                  {position.type !== 'stock' && (
                    <div className="text-xs mt-1">
                      {position.strike && `${position.strike} ${position.type.toUpperCase()}`}
                      {position.expiration && ` - ${new Date(position.expiration).toLocaleDateString()}`}
                    </div>
                  )}
                </td>
                <td className="py-4 capitalize">{position.type}</td>
                <td className="py-4">{position.quantity}</td>
                <td className="py-4">{formatCurrency(position.averagePrice)}</td>
                <td className="py-4">{formatCurrency(position.currentPrice)}</td>
                <td className={`py-4 text-right ${getProfitLossClass(position.profitLoss)}`}>
                  <div>
                    {formatCurrency(position.profitLoss)}
                  </div>
                  <div className="text-xs">
                    {position.profitLossPercent > 0 ? '+' : ''}{position.profitLossPercent.toFixed(2)}%
                  </div>
                </td>
                <td className="py-4">
                  <button 
                    className="p-2 rounded-full hover:bg-neutral-700 transition-colors"
                    onClick={() => onViewPosition(position)}
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PositionsList;