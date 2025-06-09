import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, Clock, Target, AlertTriangle, CheckCircle, Brain } from 'lucide-react';
import { RegimeAnalyzer } from '../../utils/regimeAnalyzer';
import { regimeBasedStrategies } from '../../data/regimeStrategies';
import { mockAAPLData, mockStocks } from '../../data/mockData';
import { RegimeAnalysis, StrategyRecommendation } from '../../types';
import { formatCurrency, formatPercent } from '../../utils/formatters';

const RegimeAnalysisWidget: React.FC = () => {
  const [analysis, setAnalysis] = useState<RegimeAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRecommendation, setSelectedRecommendation] = useState<StrategyRecommendation | null>(null);

  useEffect(() => {
    const performAnalysis = () => {
      setLoading(true);
      const appleStock = mockStocks.find(s => s.symbol === 'AAPL');
      if (appleStock) {
        const result = RegimeAnalyzer.performRegimeAnalysis(
          mockAAPLData,
          appleStock.price,
          regimeBasedStrategies
        );
        setAnalysis(result);
      }
      setLoading(false);
    };

    performAnalysis();
    // Refresh analysis every 30 seconds
    const interval = setInterval(performAnalysis, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !analysis) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <span className="ml-3">Analyzing market regime...</span>
        </div>
      </div>
    );
  }

  const { currentRegime, recommendations, marketInsights, riskFactors } = analysis;

  const getRegimeIcon = () => {
    switch (currentRegime.trend) {
      case 'bullish': return <TrendingUp className="text-success-400" size={24} />;
      case 'bearish': return <TrendingDown className="text-error-400" size={24} />;
      default: return <Activity className="text-neutral-400" size={24} />;
    }
  };

  const getVolatilityColor = (vol: string) => {
    switch (vol) {
      case 'high': return 'text-error-400';
      case 'medium': return 'text-warning-400';
      case 'low': return 'text-success-400';
      default: return 'text-neutral-400';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-success-400';
    if (confidence >= 60) return 'text-warning-400';
    return 'text-error-400';
  };

  return (
    <div className="space-y-6">
      {/* Current Regime Analysis */}
      <div className="card bg-gradient-to-br from-primary-900/20 to-secondary-900/20 border-primary-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Brain className="text-primary-400 mr-3" size={28} />
            <h2 className="text-xl font-semibold">AI Market Regime Analysis</h2>
          </div>
          <div className="flex items-center bg-primary-900/50 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-success-400 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm">Live Analysis</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-neutral-750/50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              {getRegimeIcon()}
              <span className="ml-2 text-sm text-neutral-400">Market Trend</span>
            </div>
            <p className="text-lg font-semibold capitalize">{currentRegime.trend}</p>
            <p className="text-sm text-neutral-400">{currentRegime.momentum.toFixed(1)}% momentum</p>
          </div>

          <div className="bg-neutral-750/50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Clock className="text-primary-400" size={20} />
              <span className="ml-2 text-sm text-neutral-400">Time Regime</span>
            </div>
            <p className="text-lg font-semibold capitalize">{currentRegime.type}</p>
            <p className="text-sm text-neutral-400">{currentRegime.timeframe}</p>
          </div>

          <div className="bg-neutral-750/50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Activity className={getVolatilityColor(currentRegime.volatility)} size={20} />
              <span className="ml-2 text-sm text-neutral-400">Volatility</span>
            </div>
            <p className="text-lg font-semibold capitalize">{currentRegime.volatility}</p>
            <p className="text-sm text-neutral-400">Current environment</p>
          </div>

          <div className="bg-neutral-750/50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Target className={getConfidenceColor(currentRegime.confidence)} size={20} />
              <span className="ml-2 text-sm text-neutral-400">Confidence</span>
            </div>
            <p className="text-lg font-semibold">{currentRegime.confidence.toFixed(0)}%</p>
            <p className="text-sm text-neutral-400">Analysis strength</p>
          </div>
        </div>

        {/* Market Insights */}
        <div className="mb-4">
          <h3 className="font-medium mb-2 flex items-center">
            <CheckCircle className="text-primary-400 mr-2" size={18} />
            Market Insights
          </h3>
          <div className="space-y-1">
            {marketInsights.map((insight, index) => (
              <p key={index} className="text-sm text-neutral-300 flex items-start">
                <span className="w-1 h-1 bg-primary-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                {insight}
              </p>
            ))}
          </div>
        </div>

        {/* Risk Factors */}
        {riskFactors.length > 0 && (
          <div className="bg-warning-900/20 border border-warning-700/30 p-3 rounded-lg">
            <h3 className="font-medium mb-2 flex items-center text-warning-400">
              <AlertTriangle className="mr-2" size={18} />
              Risk Factors
            </h3>
            <div className="space-y-1">
              {riskFactors.map((risk, index) => (
                <p key={index} className="text-sm text-warning-200 flex items-start">
                  <span className="w-1 h-1 bg-warning-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  {risk}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Strategy Recommendations */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">AI-Powered Strategy Recommendations</h2>
        
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="text-warning-400 mx-auto mb-3" size={32} />
            <p className="text-neutral-400 mb-2">No suitable strategies found</p>
            <p className="text-sm text-neutral-500">Current market conditions don't favor any strategies with high confidence</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div 
                key={rec.strategy.id}
                className={`bg-neutral-750 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedRecommendation?.strategy.id === rec.strategy.id
                    ? 'border-primary-500 bg-primary-900/20'
                    : 'border-transparent hover:border-neutral-600'
                }`}
                onClick={() => setSelectedRecommendation(selectedRecommendation?.strategy.id === rec.strategy.id ? null : rec)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-lg">{rec.strategy.name}</h3>
                    <p className="text-sm text-neutral-400">{rec.strategy.description}</p>
                  </div>
                  <div className="flex items-center">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rec.confidence >= 80 ? 'bg-success-900 text-success-400' :
                      rec.confidence >= 60 ? 'bg-warning-900 text-warning-400' :
                      'bg-error-900 text-error-400'
                    }`}>
                      {rec.confidence.toFixed(0)}% Confidence
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div>
                    <span className="text-xs text-neutral-400">Max Profit</span>
                    <p className="font-medium">
                      {typeof rec.riskReward.maxProfit === 'number' 
                        ? formatCurrency(rec.riskReward.maxProfit)
                        : 'Unlimited'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-400">Max Loss</span>
                    <p className="font-medium text-error-400">
                      {formatCurrency(rec.riskReward.maxLoss)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-400">Win Probability</span>
                    <p className="font-medium text-success-400">
                      {rec.riskReward.probabilityOfProfit.toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-400">B-S Edge</span>
                    <p className={`font-medium ${rec.blackScholesAnalysis.edge >= 0 ? 'text-success-400' : 'text-error-400'}`}>
                      {rec.blackScholesAnalysis.edge >= 0 ? '+' : ''}{formatCurrency(rec.blackScholesAnalysis.edge)}
                    </p>
                  </div>
                </div>

                {/* Reasoning */}
                <div className="mb-3">
                  <h4 className="text-sm font-medium mb-1">AI Reasoning:</h4>
                  <div className="space-y-1">
                    {rec.reasoning.slice(0, 2).map((reason, idx) => (
                      <p key={idx} className="text-xs text-neutral-400 flex items-start">
                        <span className="w-1 h-1 bg-primary-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                        {reason}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedRecommendation?.strategy.id === rec.strategy.id && (
                  <div className="border-t border-neutral-600 pt-3 mt-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Black-Scholes Analysis</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Theoretical Price:</span>
                            <span>{formatCurrency(rec.blackScholesAnalysis.theoreticalPrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Market Price:</span>
                            <span>{formatCurrency(rec.blackScholesAnalysis.marketPrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Delta:</span>
                            <span>{rec.blackScholesAnalysis.greeks.delta.toFixed(3)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Theta:</span>
                            <span>{rec.blackScholesAnalysis.greeks.theta.toFixed(3)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Complete Reasoning</h4>
                        <div className="space-y-1">
                          {rec.reasoning.map((reason, idx) => (
                            <p key={idx} className="text-xs text-neutral-400 flex items-start">
                              <span className="w-1 h-1 bg-primary-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                              {reason}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-4">
                      <button className="btn-primary flex-1">Execute Strategy</button>
                      <button className="btn-ghost flex-1">Analyze Further</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegimeAnalysisWidget;