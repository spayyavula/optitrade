import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { MarketData } from '../../types';

interface PriceChartProps {
  data: MarketData[];
  timeframe?: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
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
        <p className="text-neutral-300 text-xs mb-1">{label}</p>
        <p className="font-medium">
          ${payload[0].value.toFixed(2)}
        </p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 text-xs">
          <span className="text-neutral-400">Open</span>
          <span className="text-right">${payload[0].payload.open.toFixed(2)}</span>
          <span className="text-neutral-400">High</span>
          <span className="text-right">${payload[0].payload.high.toFixed(2)}</span>
          <span className="text-neutral-400">Low</span>
          <span className="text-right">${payload[0].payload.low.toFixed(2)}</span>
        </div>
      </div>
    );
  }

  return null;
};

const PriceChart: React.FC<PriceChartProps> = ({ data, timeframe = '3M' }) => {
  // Filter data based on timeframe
  const filterData = (): MarketData[] => {
    const currentDate = new Date();
    let filterDate = new Date();
    
    switch (timeframe) {
      case '1D':
        // For demo purposes, just show the last 5 points
        return data.slice(-5);
      case '1W':
        filterDate.setDate(currentDate.getDate() - 7);
        break;
      case '1M':
        filterDate.setMonth(currentDate.getMonth() - 1);
        break;
      case '3M':
        filterDate.setMonth(currentDate.getMonth() - 3);
        break;
      case '1Y':
        filterDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      case 'ALL':
      default:
        return data;
    }
    
    return data.filter(item => new Date(item.timestamp) >= filterDate);
  };
  
  const filteredData = filterData();
  
  // Determine if the stock is up or down overall
  const startPrice = filteredData[0]?.close || 0;
  const endPrice = filteredData[filteredData.length - 1]?.close || 0;
  const isPositive = endPrice >= startPrice;
  
  // Gradient colors based on performance
  const gradientColor = isPositive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)';
  const lineColor = isPositive ? '#22c55e' : '#ef4444';

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={filteredData}
          margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
        >
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={gradientColor} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={gradientColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis 
            dataKey="timestamp" 
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            tickLine={{ stroke: '#4B5563' }}
            axisLine={{ stroke: '#4B5563' }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return timeframe === '1D' ? 
                date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
                date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            }}
            minTickGap={30}
          />
          <YAxis 
            domain={['dataMin - 1', 'dataMax + 1']}
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            tickLine={{ stroke: '#4B5563' }}
            axisLine={{ stroke: '#4B5563' }}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="close" 
            stroke={lineColor} 
            fillOpacity={1}
            fill="url(#colorGradient)" 
            strokeWidth={2}
            activeDot={{ r: 6, stroke: lineColor, strokeWidth: 2, fill: '#111827' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;