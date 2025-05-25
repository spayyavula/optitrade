import React, { useState, useEffect } from 'react';
import { formatCurrency, formatPercent, getProfitLossClass } from '../../utils/formatters';

interface StockPriceProps {
  symbol: string;
  price: number;
  change: number;
  percentChange: number;
  animated?: boolean;
}

const StockPrice: React.FC<StockPriceProps> = ({ 
  symbol, 
  price, 
  change, 
  percentChange,
  animated = false
}) => {
  const [currentPrice, setCurrentPrice] = useState<number>(price);
  const [currentChange, setCurrentChange] = useState<number>(change);
  const [currentPercentChange, setCurrentPercentChange] = useState<number>(percentChange);
  const [priceChanged, setPriceChanged] = useState<boolean>(false);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (animated && price !== currentPrice) {
      setDirection(price > currentPrice ? 'up' : 'down');
      setPriceChanged(true);
      setCurrentPrice(price);
      setCurrentChange(change);
      setCurrentPercentChange(percentChange);
      
      const timer = setTimeout(() => {
        setPriceChanged(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [price, change, percentChange, currentPrice, animated]);

  const priceClass = getProfitLossClass(currentChange);
  const flashClass = direction === 'up' 
    ? 'bg-success-500 bg-opacity-20' 
    : direction === 'down' 
      ? 'bg-error-500 bg-opacity-20' 
      : '';

  return (
    <div className="flex items-baseline">
      <div className="flex flex-col">
        <div className="flex items-baseline">
          <span className="text-lg font-medium mr-2">{symbol}</span>
          <span className={`text-xl font-semibold ${priceChanged ? flashClass : ''} transition-colors duration-500 px-1 rounded`}>
            {formatCurrency(currentPrice)}
          </span>
        </div>
        <div className={`flex items-center ${priceClass}`}>
          <span className="mr-1">{formatCurrency(currentChange)}</span>
          <span>({formatPercent(currentPercentChange)})</span>
        </div>
      </div>
    </div>
  );
};

export default StockPrice;