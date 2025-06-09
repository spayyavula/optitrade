import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { usePolygonData } from '../../hooks/usePolygonData';
import { formatCurrency, formatPercent, getProfitLossClass } from '../../utils/formatters';

interface LivePriceDisplayProps {
  symbol: string;
  showChange?: boolean;
  showVolume?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LivePriceDisplay: React.FC<LivePriceDisplayProps> = ({ 
  symbol, 
  showChange = true, 
  showVolume = false,
  size = 'md',
  className = ''
}) => {
  const { quote, loading, error, lastUpdate } = usePolygonData({ symbol });
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | null>(null);
  const [flashClass, setFlashClass] = useState('');

  useEffect(() => {
    if (quote && quote.last !== previousPrice) {
      if (previousPrice !== null) {
        setPriceDirection(quote.last > previousPrice ? 'up' : 'down');
        setFlashClass(quote.last > previousPrice ? 'bg-success-500/20' : 'bg-error-500/20');
        
        // Clear flash after animation
        setTimeout(() => setFlashClass(''), 1000);
      }
      setPreviousPrice(quote.last);
    }
  }, [quote, previousPrice]);

  if (loading) {
    return (
      <div className={`flex items-center ${className}`}>
        <Activity size={16} className="animate-pulse text-neutral-400 mr-2" />
        <span className="text-neutral-400">Loading {symbol}...</span>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className={`flex items-center ${className}`}>
        <span className="text-error-400 text-sm">Error loading {symbol}</span>
      </div>
    );
  }

  const change = quote.last - (quote.bid + quote.ask) / 2; // Approximate change
  const percentChange = (change / quote.last) * 100;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const priceSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-baseline ${className}`}>
      <div className="flex flex-col">
        <div className="flex items-baseline">
          <span className={`font-medium mr-2 ${sizeClasses[size]}`}>{symbol}</span>
          <span className={`font-semibold ${priceSizeClasses[size]} ${flashClass} transition-colors duration-500 px-1 rounded`}>
            {formatCurrency(quote.last)}
          </span>
          {priceDirection && (
            <span className={`ml-1 ${priceDirection === 'up' ? 'text-success-400' : 'text-error-400'}`}>
              {priceDirection === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            </span>
          )}
        </div>
        
        {showChange && (
          <div className={`flex items-center ${getProfitLossClass(percentChange)} ${sizeClasses[size]}`}>
            <span className="mr-1">{formatCurrency(change)}</span>
            <span>({formatPercent(percentChange)})</span>
          </div>
        )}
        
        {showVolume && (
          <div className={`text-neutral-400 ${sizeClasses[size]}`}>
            Vol: {quote.volume.toLocaleString()}
          </div>
        )}
        
        <div className="text-xs text-neutral-500">
          Bid: {formatCurrency(quote.bid)} | Ask: {formatCurrency(quote.ask)}
          {lastUpdate && (
            <span className="ml-2">
              {new Date().getTime() - lastUpdate.getTime() < 5000 ? 'Live' : 'Delayed'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LivePriceDisplay;