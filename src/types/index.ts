export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  percentChange: number;
  volume: number;
}

export interface Option {
  strike: number;
  expiration: string;
  type: 'call' | 'put';
  bid: number;
  ask: number;
  last: number;
  change: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  inTheMoney: boolean;
}

export interface OptionsChain {
  symbol: string;
  expirations: string[];
  calls: Option[];
  puts: Option[];
}

export interface Position {
  id: string;
  symbol: string;
  type: 'call' | 'put' | 'stock';
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  strike?: number;
  expiration?: string;
  profitLoss: number;
  profitLossPercent: number;
}

export interface Strategy {
  id: string;
  name: string;
  legs: StrategyLeg[];
  maxProfit?: number;
  maxLoss?: number;
  breakEven?: number[];
}

export interface StrategyLeg {
  id: string;
  type: 'call' | 'put';
  strike: number;
  expiration: string;
  action: 'buy' | 'sell';
  quantity: number;
  price: number;
}

export interface MarketData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  percentChange: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  accountValue: number;
  buyingPower: number;
  cashBalance: number;
}