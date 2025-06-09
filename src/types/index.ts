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
  description?: string;
  regime?: 'short-term' | 'medium-term' | 'long-term';
  marketCondition?: 'bullish' | 'bearish' | 'neutral' | 'volatile';
  legs: StrategyLeg[];
  maxProfit?: number | string;
  maxLoss?: number | string;
  breakEven?: number[];
  timeDecay?: 'positive' | 'negative' | 'neutral';
  volatilityBias?: 'long' | 'short' | 'neutral';
  complexity?: 'beginner' | 'intermediate' | 'advanced';
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

export interface MarketRegime {
  type: 'short-term' | 'medium-term' | 'long-term';
  trend: 'bullish' | 'bearish' | 'neutral';
  volatility: 'low' | 'medium' | 'high';
  momentum: number; // -100 to 100
  confidence: number; // 0 to 100
  timeframe: string;
}

export interface StrategyRecommendation {
  strategy: Strategy;
  confidence: number;
  reasoning: string[];
  optimalEntry: {
    price: number;
    impliedVolatility: number;
    timeToExpiry: number;
  };
  riskReward: {
    maxProfit: number;
    maxLoss: number;
    probabilityOfProfit: number;
  };
  blackScholesAnalysis: {
    theoreticalPrice: number;
    marketPrice: number;
    edge: number; // positive means underpriced
    greeks: {
      delta: number;
      gamma: number;
      theta: number;
      vega: number;
    };
  };
}

export interface RegimeAnalysis {
  currentRegime: MarketRegime;
  recommendations: StrategyRecommendation[];
  marketInsights: string[];
  riskFactors: string[];
}