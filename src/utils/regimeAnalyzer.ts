import { MarketRegime, Strategy, StrategyRecommendation, RegimeAnalysis, Stock, MarketData } from '../types';
import { blackScholes } from './blackScholes';

export class RegimeAnalyzer {
  // Analyze market regime based on price action and volatility
  static analyzeRegime(stockData: MarketData[], currentPrice: number): MarketRegime {
    const shortTermData = stockData.slice(-5); // Last 5 days
    const mediumTermData = stockData.slice(-20); // Last 20 days
    const longTermData = stockData.slice(-60); // Last 60 days

    // Calculate returns and volatility for different timeframes
    const shortTermReturns = this.calculateReturns(shortTermData);
    const mediumTermReturns = this.calculateReturns(mediumTermData);
    const longTermReturns = this.calculateReturns(longTermData);

    const shortTermVol = this.calculateVolatility(shortTermReturns);
    const mediumTermVol = this.calculateVolatility(mediumTermReturns);
    const longTermVol = this.calculateVolatility(longTermReturns);

    // Determine dominant regime
    const regimes = [
      {
        type: 'short-term' as const,
        volatility: shortTermVol,
        momentum: this.calculateMomentum(shortTermData),
        strength: this.calculateRegimeStrength(shortTermData, currentPrice)
      },
      {
        type: 'medium-term' as const,
        volatility: mediumTermVol,
        momentum: this.calculateMomentum(mediumTermData),
        strength: this.calculateRegimeStrength(mediumTermData, currentPrice)
      },
      {
        type: 'long-term' as const,
        volatility: longTermVol,
        momentum: this.calculateMomentum(longTermData),
        strength: this.calculateRegimeStrength(longTermData, currentPrice)
      }
    ];

    // Select regime with highest strength
    const dominantRegime = regimes.reduce((prev, current) => 
      current.strength > prev.strength ? current : prev
    );

    return {
      type: dominantRegime.type,
      trend: dominantRegime.momentum > 10 ? 'bullish' : dominantRegime.momentum < -10 ? 'bearish' : 'neutral',
      volatility: dominantRegime.volatility > 0.3 ? 'high' : dominantRegime.volatility > 0.15 ? 'medium' : 'low',
      momentum: dominantRegime.momentum,
      confidence: Math.min(95, dominantRegime.strength * 100),
      timeframe: this.getTimeframeDescription(dominantRegime.type)
    };
  }

  // Calculate strategy recommendations based on regime
  static getStrategyRecommendations(
    regime: MarketRegime,
    stockPrice: number,
    availableStrategies: Strategy[],
    riskFreeRate: number = 0.05
  ): StrategyRecommendation[] {
    const recommendations: StrategyRecommendation[] = [];

    // Filter strategies by regime and market condition
    const suitableStrategies = availableStrategies.filter(strategy => {
      const regimeMatch = strategy.regime === regime.type;
      const conditionMatch = strategy.marketCondition === regime.trend || strategy.marketCondition === 'neutral';
      return regimeMatch && conditionMatch;
    });

    for (const strategy of suitableStrategies) {
      const recommendation = this.analyzeStrategy(strategy, stockPrice, regime, riskFreeRate);
      if (recommendation.confidence > 60) { // Only recommend high-confidence strategies
        recommendations.push(recommendation);
      }
    }

    // Sort by confidence and potential profit
    return recommendations.sort((a, b) => {
      const scoreA = a.confidence * 0.6 + (a.riskReward.probabilityOfProfit * 0.4);
      const scoreB = b.confidence * 0.6 + (b.riskReward.probabilityOfProfit * 0.4);
      return scoreB - scoreA;
    }).slice(0, 3); // Top 3 recommendations
  }

  // Analyze individual strategy using Black-Scholes
  private static analyzeStrategy(
    strategy: Strategy,
    stockPrice: number,
    regime: MarketRegime,
    riskFreeRate: number
  ): StrategyRecommendation {
    const primaryLeg = strategy.legs[0];
    const timeToExpiry = this.calculateTimeToExpiry(primaryLeg.expiration);
    const impliedVol = this.estimateImpliedVolatility(regime.volatility);

    // Calculate Black-Scholes theoretical price
    const theoreticalPrice = primaryLeg.type === 'call'
      ? blackScholes.calculateCall(stockPrice, primaryLeg.strike, riskFreeRate, impliedVol, timeToExpiry)
      : blackScholes.calculatePut(stockPrice, primaryLeg.strike, riskFreeRate, impliedVol, timeToExpiry);

    const marketPrice = primaryLeg.price;
    const edge = theoreticalPrice - marketPrice;

    // Calculate Greeks
    const [d1, d2] = blackScholes.calculateD1D2(stockPrice, primaryLeg.strike, riskFreeRate, impliedVol, timeToExpiry);
    const greeks = this.calculateGreeks(stockPrice, primaryLeg.strike, riskFreeRate, impliedVol, timeToExpiry, d1, d2, primaryLeg.type);

    // Calculate confidence based on multiple factors
    const confidence = this.calculateStrategyConfidence(strategy, regime, edge, greeks);

    // Calculate risk/reward metrics
    const riskReward = this.calculateRiskReward(strategy, stockPrice, regime);

    return {
      strategy,
      confidence,
      reasoning: this.generateReasoning(strategy, regime, edge, greeks),
      optimalEntry: {
        price: theoreticalPrice,
        impliedVolatility: impliedVol,
        timeToExpiry
      },
      riskReward,
      blackScholesAnalysis: {
        theoreticalPrice,
        marketPrice,
        edge,
        greeks
      }
    };
  }

  // Helper methods
  private static calculateReturns(data: MarketData[]): number[] {
    const returns: number[] = [];
    for (let i = 1; i < data.length; i++) {
      returns.push((data[i].close - data[i-1].close) / data[i-1].close);
    }
    return returns;
  }

  private static calculateVolatility(returns: number[]): number {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    return Math.sqrt(variance * 252); // Annualized volatility
  }

  private static calculateMomentum(data: MarketData[]): number {
    if (data.length < 2) return 0;
    const start = data[0].close;
    const end = data[data.length - 1].close;
    return ((end - start) / start) * 100;
  }

  private static calculateRegimeStrength(data: MarketData[], currentPrice: number): number {
    // Calculate trend consistency and volume confirmation
    const priceChanges = this.calculateReturns(data);
    const consistency = this.calculateTrendConsistency(priceChanges);
    const volumeConfirmation = this.calculateVolumeConfirmation(data);
    
    return (consistency * 0.7 + volumeConfirmation * 0.3);
  }

  private static calculateTrendConsistency(returns: number[]): number {
    if (returns.length === 0) return 0;
    
    const positiveReturns = returns.filter(r => r > 0).length;
    const negativeReturns = returns.filter(r => r < 0).length;
    const total = returns.length;
    
    return Math.max(positiveReturns, negativeReturns) / total;
  }

  private static calculateVolumeConfirmation(data: MarketData[]): number {
    if (data.length < 2) return 0.5;
    
    const avgVolume = data.reduce((sum, d) => sum + d.volume, 0) / data.length;
    const recentVolume = data[data.length - 1].volume;
    
    return Math.min(1, recentVolume / avgVolume);
  }

  private static getTimeframeDescription(type: 'short-term' | 'medium-term' | 'long-term'): string {
    switch (type) {
      case 'short-term': return '1-7 days';
      case 'medium-term': return '1-8 weeks';
      case 'long-term': return '2-12 months';
    }
  }

  private static calculateTimeToExpiry(expiration: string): number {
    const expiryDate = new Date(expiration);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    return Math.max(0.001, diffTime / (1000 * 3600 * 24 * 365)); // Years
  }

  private static estimateImpliedVolatility(volatilityRegime: 'low' | 'medium' | 'high'): number {
    switch (volatilityRegime) {
      case 'low': return 0.15;
      case 'medium': return 0.25;
      case 'high': return 0.40;
    }
  }

  private static calculateGreeks(
    S: number, K: number, r: number, sigma: number, T: number, 
    d1: number, d2: number, type: 'call' | 'put'
  ) {
    const phi = (x: number) => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
    const N = blackScholes.normalCDF;

    const delta = type === 'call' ? N(d1) : N(d1) - 1;
    const gamma = phi(d1) / (S * sigma * Math.sqrt(T));
    const theta = type === 'call'
      ? (-S * phi(d1) * sigma / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * N(d2)) / 365
      : (-S * phi(d1) * sigma / (2 * Math.sqrt(T)) + r * K * Math.exp(-r * T) * N(-d2)) / 365;
    const vega = S * phi(d1) * Math.sqrt(T) / 100;

    return { delta, gamma, theta, vega };
  }

  private static calculateStrategyConfidence(
    strategy: Strategy,
    regime: MarketRegime,
    edge: number,
    greeks: any
  ): number {
    let confidence = 50; // Base confidence

    // Regime alignment bonus
    if (strategy.regime === regime.type) confidence += 20;

    // Market condition alignment
    if (strategy.marketCondition === regime.trend) confidence += 15;

    // Black-Scholes edge bonus/penalty
    if (edge > 0) confidence += Math.min(20, edge * 100);
    else confidence += Math.max(-20, edge * 100);

    // Volatility alignment
    if (strategy.volatilityBias === 'long' && regime.volatility === 'high') confidence += 10;
    if (strategy.volatilityBias === 'short' && regime.volatility === 'low') confidence += 10;

    // Time decay consideration
    if (strategy.timeDecay === 'positive' && Math.abs(greeks.theta) > 0.1) confidence += 5;

    return Math.max(0, Math.min(100, confidence));
  }

  private static calculateRiskReward(strategy: Strategy, stockPrice: number, regime: MarketRegime) {
    // Simplified risk/reward calculation
    const maxProfit = typeof strategy.maxProfit === 'number' ? strategy.maxProfit : 1000;
    const maxLoss = typeof strategy.maxLoss === 'number' ? strategy.maxLoss : 500;
    
    // Probability of profit based on regime and strategy alignment
    let probabilityOfProfit = 50;
    if (strategy.regime === regime.type) probabilityOfProfit += 15;
    if (strategy.marketCondition === regime.trend) probabilityOfProfit += 10;
    
    return {
      maxProfit,
      maxLoss,
      probabilityOfProfit: Math.min(85, probabilityOfProfit)
    };
  }

  private static generateReasoning(strategy: Strategy, regime: MarketRegime, edge: number, greeks: any): string[] {
    const reasoning: string[] = [];

    reasoning.push(`${regime.type} regime detected with ${regime.confidence.toFixed(0)}% confidence`);
    
    if (strategy.regime === regime.type) {
      reasoning.push(`Strategy perfectly aligned with current ${regime.type} market regime`);
    }

    if (edge > 0) {
      reasoning.push(`Options appear underpriced by $${edge.toFixed(2)} based on Black-Scholes model`);
    } else if (edge < -0.5) {
      reasoning.push(`Options may be overpriced by $${Math.abs(edge).toFixed(2)} - consider waiting`);
    }

    if (regime.trend === 'bullish' && strategy.marketCondition === 'bullish') {
      reasoning.push(`Bullish strategy matches current upward momentum of ${regime.momentum.toFixed(1)}%`);
    }

    if (Math.abs(greeks.theta) > 0.1) {
      reasoning.push(`High time decay (${greeks.theta.toFixed(3)}) - time is ${greeks.theta < 0 ? 'working against' : 'working for'} this position`);
    }

    if (regime.volatility === 'high' && strategy.volatilityBias === 'long') {
      reasoning.push(`High volatility environment favors volatility-long strategies`);
    }

    return reasoning;
  }

  // Main analysis function
  static performRegimeAnalysis(
    stockData: MarketData[],
    currentPrice: number,
    availableStrategies: Strategy[]
  ): RegimeAnalysis {
    const currentRegime = this.analyzeRegime(stockData, currentPrice);
    const recommendations = this.getStrategyRecommendations(currentRegime, currentPrice, availableStrategies);
    
    const marketInsights = this.generateMarketInsights(currentRegime, stockData);
    const riskFactors = this.identifyRiskFactors(currentRegime, stockData);

    return {
      currentRegime,
      recommendations,
      marketInsights,
      riskFactors
    };
  }

  private static generateMarketInsights(regime: MarketRegime, data: MarketData[]): string[] {
    const insights: string[] = [];
    
    insights.push(`Market is in a ${regime.type} ${regime.trend} regime with ${regime.volatility} volatility`);
    
    if (regime.momentum > 20) {
      insights.push(`Strong upward momentum suggests continuation of bullish trend`);
    } else if (regime.momentum < -20) {
      insights.push(`Strong downward momentum indicates bearish pressure`);
    }

    if (regime.volatility === 'high') {
      insights.push(`High volatility creates opportunities for premium sellers and straddle buyers`);
    }

    if (regime.confidence > 80) {
      insights.push(`High confidence in regime analysis - signals are clear and consistent`);
    }

    return insights;
  }

  private static identifyRiskFactors(regime: MarketRegime, data: MarketData[]): string[] {
    const risks: string[] = [];
    
    if (regime.confidence < 70) {
      risks.push(`Low confidence in regime analysis - market signals are mixed`);
    }

    if (regime.volatility === 'high') {
      risks.push(`High volatility increases risk of sudden price movements`);
    }

    const recentVolatility = this.calculateVolatility(this.calculateReturns(data.slice(-5)));
    if (recentVolatility > 0.5) {
      risks.push(`Recent volatility spike may indicate unstable market conditions`);
    }

    if (regime.type === 'short-term' && regime.momentum > 30) {
      risks.push(`Extreme short-term momentum may lead to reversal`);
    }

    return risks;
  }
}