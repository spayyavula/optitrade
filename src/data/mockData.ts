import { Stock, Option, OptionsChain, Position, Strategy, MarketData, WatchlistItem, User } from '../types';
import { format, subDays, addDays } from 'date-fns';

// Helper function to generate random number within range
const randomNumber = (min: number, max: number, decimals: number = 2): number => {
  const num = Math.random() * (max - min) + min;
  return parseFloat(num.toFixed(decimals));
};

// Generate dates
const today = new Date();
const formatDate = (date: Date): string => format(date, 'yyyy-MM-dd');
const expirationDates = [
  formatDate(addDays(today, 3)),
  formatDate(addDays(today, 10)),
  formatDate(addDays(today, 17)),
  formatDate(addDays(today, 31)),
  formatDate(addDays(today, 45)),
  formatDate(addDays(today, 73)),
];

// Mock Stocks
export const mockStocks: Stock[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 178.72, change: 1.25, percentChange: 0.70, volume: 67892345 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 402.56, change: -2.34, percentChange: -0.58, volume: 23415789 },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', price: 178.25, change: 3.42, percentChange: 1.95, volume: 45678123 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.89, change: 0.56, percentChange: 0.39, volume: 12345678 },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 177.04, change: -5.67, percentChange: -3.10, volume: 89012345 },
  { symbol: 'META', name: 'Meta Platforms, Inc.', price: 474.33, change: 8.91, percentChange: 1.91, volume: 34567890 },
  { symbol: 'NFLX', name: 'Netflix, Inc.', price: 634.80, change: 12.45, percentChange: 2.00, volume: 5678901 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 926.69, change: -15.78, percentChange: -1.67, volume: 78901234 },
];

// Generate Options Chain
const generateOptions = (basePrice: number, isCall: boolean): Option[] => {
  const options: Option[] = [];
  const type = isCall ? 'call' : 'put';
  const strikeDiff = basePrice * 0.025; // 2.5% increments
  
  for (let i = -8; i <= 8; i++) {
    const strike = parseFloat((basePrice + i * strikeDiff).toFixed(2));
    const inTheMoney = isCall ? strike < basePrice : strike > basePrice;
    
    // Calculate option price based on moneyness and randomness
    const intrinsicValue = inTheMoney 
      ? isCall ? basePrice - strike : strike - basePrice 
      : 0;
    
    // Add time value (more for at-the-money options)
    const timeValue = randomNumber(0.5, 3) * (1 - Math.abs((basePrice - strike) / basePrice));
    const price = intrinsicValue + timeValue;
    
    // Random but realistic values
    const bid = parseFloat((price - randomNumber(0.05, 0.2)).toFixed(2));
    const ask = parseFloat((price + randomNumber(0.05, 0.2)).toFixed(2));
    const last = parseFloat(((bid + ask) / 2 + randomNumber(-0.1, 0.1)).toFixed(2));
    const change = parseFloat(randomNumber(-0.5, 0.5).toFixed(2));

    // Generate for each expiration date
    expirationDates.forEach(expiration => {
      // Further dates have higher prices
      const daysToExpiry = Math.floor((new Date(expiration).getTime() - today.getTime()) / (1000 * 3600 * 24));
      const timeMultiplier = Math.sqrt(daysToExpiry / 7);
      
      const adjustedBid = parseFloat((bid * timeMultiplier).toFixed(2));
      const adjustedAsk = parseFloat((ask * timeMultiplier).toFixed(2));
      const adjustedLast = parseFloat((last * timeMultiplier).toFixed(2));
      
      options.push({
        strike,
        expiration,
        type,
        bid: Math.max(0.01, adjustedBid),
        ask: Math.max(0.01, adjustedAsk),
        last: Math.max(0.01, adjustedLast),
        change,
        volume: Math.floor(randomNumber(100, 5000)),
        openInterest: Math.floor(randomNumber(500, 10000)),
        impliedVolatility: randomNumber(0.2, 0.8, 3),
        inTheMoney
      });
    });
  }
  
  return options;
};

// Mock Options Chains
export const mockOptionsChain: OptionsChain = {
  symbol: 'AAPL',
  expirations: expirationDates,
  calls: generateOptions(178.72, true),
  puts: generateOptions(178.72, false)
};

// Mock Positions
export const mockPositions: Position[] = [
  {
    id: '1',
    symbol: 'AAPL',
    type: 'call',
    quantity: 2,
    averagePrice: 4.25,
    currentPrice: 5.10,
    strike: 175,
    expiration: expirationDates[2],
    profitLoss: 170,
    profitLossPercent: 20
  },
  {
    id: '2',
    symbol: 'MSFT',
    type: 'put',
    quantity: 1,
    averagePrice: 6.75,
    currentPrice: 5.80,
    strike: 405,
    expiration: expirationDates[3],
    profitLoss: -95,
    profitLossPercent: -14.07
  },
  {
    id: '3',
    symbol: 'TSLA',
    type: 'stock',
    quantity: 10,
    averagePrice: 165.30,
    currentPrice: 177.04,
    profitLoss: 117.4,
    profitLossPercent: 7.1
  },
  {
    id: '4',
    symbol: 'NVDA',
    type: 'call',
    quantity: 3,
    averagePrice: 25.40,
    currentPrice: 28.75,
    strike: 900,
    expiration: expirationDates[4],
    profitLoss: 1005,
    profitLossPercent: 13.19
  },
];

// Mock Strategies
export const mockStrategies: Strategy[] = [
  // Bullish Strategies
  {
    id: 'bull-call-spread',
    name: 'Bull Call Spread',
    description: 'A bullish strategy that profits from moderate price increases while limiting risk.',
    regime: 'bullish',
    legs: [
      {
        id: '1a',
        type: 'call',
        strike: 175,
        expiration: expirationDates[2],
        action: 'buy',
        quantity: 1,
        price: 5.10
      },
      {
        id: '1b',
        type: 'call',
        strike: 185,
        expiration: expirationDates[2],
        action: 'sell',
        quantity: 1,
        price: 1.25
      }
    ],
    maxProfit: 385,
    maxLoss: 385,
    breakEven: [178.85]
  },
  {
    id: 'risk-reversal',
    name: 'Risk Reversal',
    description: 'A strongly bullish strategy that combines a short put with a long call.',
    regime: 'bullish',
    legs: [
      {
        id: '2a',
        type: 'call',
        strike: 180,
        expiration: expirationDates[2],
        action: 'buy',
        quantity: 1,
        price: 4.20
      },
      {
        id: '2b',
        type: 'put',
        strike: 170,
        expiration: expirationDates[2],
        action: 'sell',
        quantity: 1,
        price: 2.50
      }
    ],
    maxProfit: 'Unlimited',
    maxLoss: 'Substantial',
    breakEven: [181.70]
  },
  {
    id: 'call-backspread',
    name: 'Call Ratio Backspread',
    description: 'A bullish strategy that profits from significant upward moves.',
    regime: 'bullish',
    legs: [
      {
        id: '3a',
        type: 'call',
        strike: 175,
        expiration: expirationDates[2],
        action: 'sell',
        quantity: 1,
        price: 5.10
      },
      {
        id: '3b',
        type: 'call',
        strike: 180,
        expiration: expirationDates[2],
        action: 'buy',
        quantity: 2,
        price: 3.30
      }
    ],
    maxProfit: 'Unlimited',
    maxLoss: 'Limited',
    breakEven: [183.50, 191.50]
  },
  
  // Bearish Strategies
  {
    id: 'bear-put-spread',
    name: 'Bear Put Spread',
    description: 'A bearish strategy that profits from moderate price decreases while limiting risk.',
    regime: 'bearish',
    legs: [
      {
        id: '4a',
        type: 'put',
        strike: 180,
        expiration: expirationDates[2],
        action: 'buy',
        quantity: 1,
        price: 4.80
      },
      {
        id: '4b',
        type: 'put',
        strike: 170,
        expiration: expirationDates[2],
        action: 'sell',
        quantity: 1,
        price: 2.30
      }
    ],
    maxProfit: 750,
    maxLoss: 250,
    breakEven: [177.50]
  },
  {
    id: 'put-backspread',
    name: 'Put Ratio Backspread',
    description: 'A bearish strategy that profits from significant downward moves.',
    regime: 'bearish',
    legs: [
      {
        id: '5a',
        type: 'put',
        strike: 175,
        expiration: expirationDates[2],
        action: 'sell',
        quantity: 1,
        price: 3.50
      },
      {
        id: '5b',
        type: 'put',
        strike: 170,
        expiration: expirationDates[2],
        action: 'buy',
        quantity: 2,
        price: 2.30
      }
    ],
    maxProfit: 'Substantial',
    maxLoss: 'Limited',
    breakEven: [165, 171.50]
  },
  {
    id: 'synthetic-short',
    name: 'Synthetic Short',
    description: 'A bearish strategy that simulates a short stock position using options.',
    regime: 'bearish',
    legs: [
      {
        id: '6a',
        type: 'put',
        strike: 175,
        expiration: expirationDates[2],
        action: 'buy',
        quantity: 1,
        price: 3.50
      },
      {
        id: '6b',
        type: 'call',
        strike: 175,
        expiration: expirationDates[2],
        action: 'sell',
        quantity: 1,
        price: 5.10
      }
    ],
    maxProfit: 'Substantial',
    maxLoss: 'Unlimited',
    breakEven: [175]
  },
  
  // Neutral Strategies
  {
    id: 'iron-condor',
    name: 'Iron Condor',
    description: 'A neutral strategy that profits from low volatility and sideways price action.',
    regime: 'neutral',
    legs: [
      {
        id: '7a',
        type: 'call',
        strike: 185,
        expiration: expirationDates[2],
        action: 'sell',
        quantity: 1,
        price: 2.45
      },
      {
        id: '7b',
        type: 'call',
        strike: 190,
        expiration: expirationDates[2],
        action: 'buy',
        quantity: 1,
        price: 1.15
      },
      {
        id: '7c',
        type: 'put',
        strike: 165,
        expiration: expirationDates[2],
        action: 'sell',
        quantity: 1,
        price: 1.95
      },
      {
        id: '7d',
        type: 'put',
        strike: 160,
        expiration: expirationDates[2],
        action: 'buy',
        quantity: 1,
        price: 0.85
      }
    ],
    maxProfit: 240,
    maxLoss: 760,
    breakEven: [162.40, 187.60]
  },
  {
    id: 'butterfly',
    name: 'Long Butterfly',
    description: 'A neutral strategy that profits from the stock price staying near the middle strike.',
    regime: 'neutral',
    legs: [
      {
        id: '8a',
        type: 'call',
        strike: 170,
        expiration: expirationDates[2],
        action: 'buy',
        quantity: 1,
        price: 8.50
      },
      {
        id: '8b',
        type: 'call',
        strike: 175,
        expiration: expirationDates[2],
        action: 'sell',
        quantity: 2,
        price: 5.10
      },
      {
        id: '8c',
        type: 'call',
        strike: 180,
        expiration: expirationDates[2],
        action: 'buy',
        quantity: 1,
        price: 3.30
      }
    ],
    maxProfit: 340,
    maxLoss: 160,
    breakEven: [171.60, 178.40]
  },
  {
    id: 'calendar-spread',
    name: 'Calendar Spread',
    description: 'A neutral strategy that profits from time decay and stable prices.',
    regime: 'neutral',
    legs: [
      {
        id: '9a',
        type: 'call',
        strike: 175,
        expiration: expirationDates[1],
        action: 'sell',
        quantity: 1,
        price: 4.20
      },
      {
        id: '9b',
        type: 'call',
        strike: 175,
        expiration: expirationDates[3],
        action: 'buy',
        quantity: 1,
        price: 6.30
      }
    ],
    maxProfit: 'Limited',
    maxLoss: 'Limited',
    breakEven: [172, 178]
  }
];

// Mock Market Data (for charts)
export const generateMarketData = (
  days: number, 
  startPrice: number
): MarketData[] => {
  const data: MarketData[] = [];
  let currentPrice = startPrice;
  
  for (let i = days; i >= 0; i--) {
    const date = subDays(today, i);
    const change = randomNumber(-0.015, 0.015);
    currentPrice = parseFloat((currentPrice * (1 + change)).toFixed(2));
    const open = currentPrice;
    const close = parseFloat((open * (1 + randomNumber(-0.02, 0.02))).toFixed(2));
    const high = parseFloat(Math.max(open, close, open * (1 + randomNumber(0.005, 0.03))).toFixed(2));
    const low = parseFloat(Math.min(open, close, open * (1 - randomNumber(0.005, 0.03))).toFixed(2));
    
    data.push({
      timestamp: format(date, 'yyyy-MM-dd'),
      open,
      high,
      low,
      close,
      volume: Math.floor(randomNumber(1000000, 50000000))
    });
  }
  
  return data;
};

export const mockAAPLData = generateMarketData(90, 170);

// Mock Watchlist
export const mockWatchlist: WatchlistItem[] = mockStocks.slice(0, 5);

// Mock User
export const mockUser: User = {
  id: '1',
  name: 'Alex Trader',
  email: 'alex@example.com',
  accountValue: 25478.92,
  buyingPower: 15320.45,
  cashBalance: 5320.45
};