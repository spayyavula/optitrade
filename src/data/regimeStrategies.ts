import { Strategy } from '../types';
import { format, addDays } from 'date-fns';

const today = new Date();
const formatDate = (date: Date): string => format(date, 'yyyy-MM-dd');

// Enhanced strategies with regime and market condition classifications
export const regimeBasedStrategies: Strategy[] = [
  // SHORT-TERM STRATEGIES (1-7 days)
  {
    id: 'short-term-momentum-call',
    name: 'Momentum Call',
    description: 'Quick directional play on short-term bullish momentum',
    regime: 'short-term',
    marketCondition: 'bullish',
    timeDecay: 'negative',
    volatilityBias: 'neutral',
    complexity: 'beginner',
    legs: [
      {
        id: '1',
        type: 'call',
        strike: 180,
        expiration: formatDate(addDays(today, 3)),
        action: 'buy',
        quantity: 1,
        price: 2.50
      }
    ],
    maxProfit: 'Unlimited',
    maxLoss: 250,
    breakEven: [182.50]
  },
  {
    id: 'short-term-scalp-straddle',
    name: 'Scalp Straddle',
    description: 'Profit from short-term volatility spikes',
    regime: 'short-term',
    marketCondition: 'volatile',
    timeDecay: 'negative',
    volatilityBias: 'long',
    complexity: 'intermediate',
    legs: [
      {
        id: '1a',
        type: 'call',
        strike: 175,
        expiration: formatDate(addDays(today, 2)),
        action: 'buy',
        quantity: 1,
        price: 3.20
      },
      {
        id: '1b',
        type: 'put',
        strike: 175,
        expiration: formatDate(addDays(today, 2)),
        action: 'buy',
        quantity: 1,
        price: 2.80
      }
    ],
    maxProfit: 'Unlimited',
    maxLoss: 600,
    breakEven: [169, 181]
  },
  {
    id: 'short-term-bear-put',
    name: 'Quick Bear Put',
    description: 'Short-term bearish directional play',
    regime: 'short-term',
    marketCondition: 'bearish',
    timeDecay: 'negative',
    volatilityBias: 'neutral',
    complexity: 'beginner',
    legs: [
      {
        id: '1',
        type: 'put',
        strike: 170,
        expiration: formatDate(addDays(today, 5)),
        action: 'buy',
        quantity: 1,
        price: 3.10
      }
    ],
    maxProfit: 16690,
    maxLoss: 310,
    breakEven: [166.90]
  },

  // MEDIUM-TERM STRATEGIES (1-8 weeks)
  {
    id: 'swing-bull-call-spread',
    name: 'Swing Bull Call Spread',
    description: 'Moderate bullish play for swing trading timeframe',
    regime: 'medium-term',
    marketCondition: 'bullish',
    timeDecay: 'neutral',
    volatilityBias: 'short',
    complexity: 'intermediate',
    legs: [
      {
        id: '1a',
        type: 'call',
        strike: 175,
        expiration: formatDate(addDays(today, 21)),
        action: 'buy',
        quantity: 1,
        price: 6.50
      },
      {
        id: '1b',
        type: 'call',
        strike: 185,
        expiration: formatDate(addDays(today, 21)),
        action: 'sell',
        quantity: 1,
        price: 2.30
      }
    ],
    maxProfit: 580,
    maxLoss: 420,
    breakEven: [179.20]
  },
  {
    id: 'swing-iron-condor',
    name: 'Swing Iron Condor',
    description: 'Range-bound strategy for sideways markets',
    regime: 'medium-term',
    marketCondition: 'neutral',
    timeDecay: 'positive',
    volatilityBias: 'short',
    complexity: 'advanced',
    legs: [
      {
        id: '1a',
        type: 'call',
        strike: 185,
        expiration: formatDate(addDays(today, 28)),
        action: 'sell',
        quantity: 1,
        price: 3.20
      },
      {
        id: '1b',
        type: 'call',
        strike: 190,
        expiration: formatDate(addDays(today, 28)),
        action: 'buy',
        quantity: 1,
        price: 1.50
      },
      {
        id: '1c',
        type: 'put',
        strike: 165,
        expiration: formatDate(addDays(today, 28)),
        action: 'sell',
        quantity: 1,
        price: 2.80
      },
      {
        id: '1d',
        type: 'put',
        strike: 160,
        expiration: formatDate(addDays(today, 28)),
        action: 'buy',
        quantity: 1,
        price: 1.20
      }
    ],
    maxProfit: 330,
    maxLoss: 170,
    breakEven: [161.70, 188.30]
  },
  {
    id: 'swing-bear-put-spread',
    name: 'Swing Bear Put Spread',
    description: 'Medium-term bearish strategy with defined risk',
    regime: 'medium-term',
    marketCondition: 'bearish',
    timeDecay: 'neutral',
    volatilityBias: 'short',
    complexity: 'intermediate',
    legs: [
      {
        id: '1a',
        type: 'put',
        strike: 175,
        expiration: formatDate(addDays(today, 35)),
        action: 'buy',
        quantity: 1,
        price: 5.80
      },
      {
        id: '1b',
        type: 'put',
        strike: 165,
        expiration: formatDate(addDays(today, 35)),
        action: 'sell',
        quantity: 1,
        price: 2.90
      }
    ],
    maxProfit: 710,
    maxLoss: 290,
    breakEven: [172.10]
  },

  // LONG-TERM STRATEGIES (2-12 months)
  {
    id: 'long-term-leap-call',
    name: 'LEAP Call',
    description: 'Long-term bullish position with high leverage',
    regime: 'long-term',
    marketCondition: 'bullish',
    timeDecay: 'negative',
    volatilityBias: 'long',
    complexity: 'beginner',
    legs: [
      {
        id: '1',
        type: 'call',
        strike: 180,
        expiration: formatDate(addDays(today, 180)),
        action: 'buy',
        quantity: 1,
        price: 12.50
      }
    ],
    maxProfit: 'Unlimited',
    maxLoss: 1250,
    breakEven: [192.50]
  },
  {
    id: 'long-term-diagonal-spread',
    name: 'Diagonal Calendar Spread',
    description: 'Long-term position with income generation',
    regime: 'long-term',
    marketCondition: 'neutral',
    timeDecay: 'positive',
    volatilityBias: 'neutral',
    complexity: 'advanced',
    legs: [
      {
        id: '1a',
        type: 'call',
        strike: 175,
        expiration: formatDate(addDays(today, 21)),
        action: 'sell',
        quantity: 1,
        price: 6.20
      },
      {
        id: '1b',
        type: 'call',
        strike: 180,
        expiration: formatDate(addDays(today, 120)),
        action: 'buy',
        quantity: 1,
        price: 9.80
      }
    ],
    maxProfit: 860,
    maxLoss: 360,
    breakEven: [183.60]
  },
  {
    id: 'long-term-protective-put',
    name: 'Protective Put (Long-term)',
    description: 'Long-term stock protection strategy',
    regime: 'long-term',
    marketCondition: 'neutral',
    timeDecay: 'negative',
    volatilityBias: 'long',
    complexity: 'beginner',
    legs: [
      {
        id: '1',
        type: 'put',
        strike: 165,
        expiration: formatDate(addDays(today, 90)),
        action: 'buy',
        quantity: 1,
        price: 4.50
      }
    ],
    maxProfit: 'Unlimited',
    maxLoss: 450,
    breakEven: [160.50]
  },
  {
    id: 'long-term-covered-call',
    name: 'Covered Call (Long-term)',
    description: 'Income generation on long stock position',
    regime: 'long-term',
    marketCondition: 'neutral',
    timeDecay: 'positive',
    volatilityBias: 'short',
    complexity: 'beginner',
    legs: [
      {
        id: '1',
        type: 'call',
        strike: 185,
        expiration: formatDate(addDays(today, 60)),
        action: 'sell',
        quantity: 1,
        price: 4.80
      }
    ],
    maxProfit: 1480, // Assuming stock at 175
    maxLoss: 'Substantial',
    breakEven: [170.20]
  }
];