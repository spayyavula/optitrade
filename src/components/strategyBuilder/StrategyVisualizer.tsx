import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer
} from 'recharts';
import { Strategy } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface StrategyVisualizerProps {
  strategy: Strategy;
  underlyingPrice: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-800 p-3 border border-neutral-700 rounded shadow-lg">
        <p className="text-neutral-300 text-sm mb-1">Stock Price: {formatCurrency(Number(label))}</p>
        <p className="font-medium text-sm text-primary-400">
          Profit/Loss: {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }

  return null;
};

const StrategyVisualizer: React.FC<StrategyVisualizerProps> = ({ strategy, underlyingPrice }) => {
  // Calculate strategy profit/loss at different price points
  const generateProfitLossData = () => {
    const priceRange = underlyingPrice * 0.3; // 30% range
    const data = [];
    const steps = 50;

    for (let i = 0; i <= steps; i++) {
      const stockPrice = underlyingPrice - priceRange + (i * (priceRange * 2) / steps);
      let profitLoss = 0;

      // Calculate profit/loss for each leg
      strategy.legs.forEach(leg => {
        const optionPrice = leg.price;
        let legPL = 0;

        if (leg.type === 'call') {
          // Call option: profit = max(0, stock price - strike) - premium
          const intrinsicValue = Math.max(0, stockPrice - leg.strike);
          legPL = leg.action === 'buy' 
            ? intrinsicValue - optionPrice 
            : optionPrice - intrinsicValue;
        } else if (leg.type === 'put') {
          // Put option: profit = max(0, strike - stock price) - premium
          const intrinsicValue = Math.max(0, leg.strike - stockPrice);
          legPL = leg.action === 'buy' 
            ? intrinsicValue - optionPrice 
            : optionPrice - intrinsicValue;
        }

        profitLoss += legPL * leg.quantity * 100; // 100 shares per contract
      });

      data.push({
        stockPrice,
        profitLoss
      });
    }

    return data;
  };

  const profitLossData = generateProfitLossData();
  
  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-4">{strategy.name} - Profit/Loss Analysis</h3>
      
      <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-neutral-750 p-3 rounded-lg">
          <span className="text-sm text-neutral-400">Max Profit</span>
          <p className="text-lg font-medium text-success-400">
            {strategy.maxProfit ? formatCurrency(strategy.maxProfit) : 'Unlimited'}
          </p>
        </div>
        <div className="bg-neutral-750 p-3 rounded-lg">
          <span className="text-sm text-neutral-400">Max Loss</span>
          <p className="text-lg font-medium text-error-400">
            {strategy.maxLoss ? formatCurrency(strategy.maxLoss) : 'Unlimited'}
          </p>
        </div>
        <div className="bg-neutral-750 p-3 rounded-lg">
          <span className="text-sm text-neutral-400">Break Even</span>
          <p className="text-lg font-medium">
            {strategy.breakEven?.map(price => formatCurrency(price)).join(', ') || 'N/A'}
          </p>
        </div>
        <div className="bg-neutral-750 p-3 rounded-lg">
          <span className="text-sm text-neutral-400">Current Stock Price</span>
          <p className="text-lg font-medium">{formatCurrency(underlyingPrice)}</p>
        </div>
      </div>
      
      <div className="h-80 mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={profitLossData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis 
              dataKey="stockPrice" 
              tickFormatter={(value) => formatCurrency(value)} 
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              domain={['dataMin', 'dataMax']}
              type="number"
              axisLine={{ stroke: '#4B5563' }}
              tickLine={{ stroke: '#4B5563' }}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value)} 
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              axisLine={{ stroke: '#4B5563' }}
              tickLine={{ stroke: '#4B5563' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={() => 'Profit/Loss'} 
              wrapperStyle={{ fontSize: '12px' }}
            />
            <ReferenceLine 
              y={0} 
              stroke="#6B7280" 
              strokeDasharray="3 3" 
            />
            <ReferenceLine 
              x={underlyingPrice} 
              stroke="#6B7280" 
              strokeDasharray="3 3" 
              label={{ 
                value: 'Current', 
                position: 'top', 
                fill: '#9CA3AF',
                fontSize: 12 
              }}
            />
            <Line 
              type="monotone" 
              dataKey="profitLoss" 
              stroke="#38bdf8" 
              dot={false} 
              strokeWidth={2}
              activeDot={{ r: 6, stroke: '#38bdf8', strokeWidth: 2, fill: '#111827' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6">
        <h4 className="font-medium mb-3">Strategy Legs</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="text-left text-neutral-400 border-b border-neutral-700">
              <tr>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Action</th>
                <th className="pb-3 font-medium">Strike</th>
                <th className="pb-3 font-medium">Expiration</th>
                <th className="pb-3 font-medium">Quantity</th>
                <th className="pb-3 font-medium">Price</th>
                <th className="pb-3 font-medium text-right">Cost</th>
              </tr>
            </thead>
            <tbody>
              {strategy.legs.map((leg) => (
                <tr key={leg.id} className="border-b border-neutral-800">
                  <td className="py-3 capitalize">{leg.type}</td>
                  <td className="py-3 capitalize">
                    <span className={leg.action === 'buy' ? 'text-success-400' : 'text-error-400'}>
                      {leg.action}
                    </span>
                  </td>
                  <td className="py-3">{formatCurrency(leg.strike)}</td>
                  <td className="py-3">{new Date(leg.expiration).toLocaleDateString()}</td>
                  <td className="py-3">{leg.quantity}</td>
                  <td className="py-3">{formatCurrency(leg.price)}</td>
                  <td className="py-3 text-right">
                    {formatCurrency(leg.price * leg.quantity * 100 * (leg.action === 'buy' ? -1 : 1))}
                  </td>
                </tr>
              ))}
              <tr className="bg-neutral-750">
                <td colSpan={6} className="py-3 text-right font-medium">Total Cost</td>
                <td className="py-3 text-right font-medium">
                  {formatCurrency(
                    strategy.legs.reduce((sum, leg) => 
                      sum + (leg.price * leg.quantity * 100 * (leg.action === 'buy' ? -1 : 1)), 0)
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StrategyVisualizer;