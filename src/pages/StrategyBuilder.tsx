import React, { useState } from 'react';
import StrategyVisualizer from '../components/strategyBuilder/StrategyVisualizer';
import RegimeAnalysisWidget from '../components/strategy/RegimeAnalysisWidget';
import { mockStrategies, mockStocks } from '../data/mockData';
import { regimeBasedStrategies } from '../data/regimeStrategies';
import { Strategy, StrategyLeg } from '../types';
import { Plus, Trash2, Brain, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const StrategyBuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ai-analysis' | 'builder' | 'library'>('ai-analysis');
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy>(mockStrategies[0]);
  const [underlyingPrice, setUnderlyingPrice] = useState(mockStocks.find(s => s.symbol === 'AAPL')?.price || 175);
  
  const [createMode, setCreateMode] = useState(false);
  const [newStrategy, setNewStrategy] = useState<Strategy>({
    id: 'new',
    name: 'New Strategy',
    legs: [],
  });
  
  const addLeg = () => {
    const newLeg: StrategyLeg = {
      id: `leg-${Date.now()}`,
      type: 'call',
      strike: underlyingPrice,
      expiration: mockStrategies[0].legs[0].expiration,
      action: 'buy',
      quantity: 1,
      price: 5.0
    };
    
    setNewStrategy(prev => ({
      ...prev,
      legs: [...prev.legs, newLeg]
    }));
  };
  
  const removeLeg = (legId: string) => {
    setNewStrategy(prev => ({
      ...prev,
      legs: prev.legs.filter(leg => leg.id !== legId)
    }));
  };
  
  const updateLeg = (legId: string, field: keyof StrategyLeg, value: any) => {
    setNewStrategy(prev => ({
      ...prev,
      legs: prev.legs.map(leg => 
        leg.id === legId ? { ...leg, [field]: value } : leg
      )
    }));
  };

  const saveStrategy = () => {
    const savedStrategy = {
      ...newStrategy,
      id: `strategy-${Date.now()}`,
      maxProfit: 500,
      maxLoss: 500,
      breakEven: [underlyingPrice]
    };
    
    setSelectedStrategy(savedStrategy);
    setCreateMode(false);
  };

  const allStrategies = [...regimeBasedStrategies, ...mockStrategies];
  
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">Options Strategy Center</h1>
        
        {/* Navigation Tabs */}
        <div className="card mb-6">
          <div className="flex space-x-1 bg-neutral-700 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('ai-analysis')}
              className={`flex-1 py-3 px-4 rounded-md transition-colors flex items-center justify-center ${
                activeTab === 'ai-analysis' 
                  ? 'bg-primary-600 text-white' 
                  : 'text-neutral-400 hover:bg-neutral-600/50'
              }`}
            >
              <Brain size={18} className="mr-2" />
              AI Market Analysis
            </button>
            <button 
              onClick={() => setActiveTab('builder')}
              className={`flex-1 py-3 px-4 rounded-md transition-colors flex items-center justify-center ${
                activeTab === 'builder' 
                  ? 'bg-primary-600 text-white' 
                  : 'text-neutral-400 hover:bg-neutral-600/50'
              }`}
            >
              <Plus size={18} className="mr-2" />
              Strategy Builder
            </button>
            <button 
              onClick={() => setActiveTab('library')}
              className={`flex-1 py-3 px-4 rounded-md transition-colors flex items-center justify-center ${
                activeTab === 'library' 
                  ? 'bg-primary-600 text-white' 
                  : 'text-neutral-400 hover:bg-neutral-600/50'
              }`}
            >
              <TrendingUp size={18} className="mr-2" />
              Strategy Library
            </button>
          </div>
        </div>

        {/* AI Analysis Tab */}
        {activeTab === 'ai-analysis' && (
          <RegimeAnalysisWidget />
        )}

        {/* Strategy Builder Tab */}
        {activeTab === 'builder' && (
          <div className="space-y-6">
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Custom Strategy Builder</h2>
                <button 
                  className="btn-primary"
                  onClick={() => setCreateMode(!createMode)}
                >
                  {createMode ? 'Cancel' : 'Create New Strategy'}
                </button>
              </div>
              
              {createMode && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="strategyName" className="block text-sm text-neutral-400 mb-1">
                      Strategy Name
                    </label>
                    <input
                      id="strategyName"
                      type="text"
                      value={newStrategy.name}
                      onChange={(e) => setNewStrategy(prev => ({ ...prev, name: e.target.value }))}
                      className="input w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Strategy Legs</h3>
                      <button
                        className="btn-ghost text-sm flex items-center"
                        onClick={addLeg}
                      >
                        <Plus size={16} className="mr-1" />
                        Add Leg
                      </button>
                    </div>
                    
                    {newStrategy.legs.length === 0 ? (
                      <div className="bg-neutral-750 p-4 rounded-lg text-center">
                        <p className="text-neutral-400 mb-2">No legs added yet</p>
                        <button
                          className="btn-primary text-sm"
                          onClick={addLeg}
                        >
                          Add First Leg
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {newStrategy.legs.map((leg, index) => (
                          <div key={leg.id} className="bg-neutral-750 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-medium">Leg {index + 1}</h4>
                              <button
                                className="text-neutral-400 hover:text-error-400"
                                onClick={() => removeLeg(leg.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs text-neutral-400 mb-1">Option Type</label>
                                <select
                                  value={leg.type}
                                  onChange={(e) => updateLeg(leg.id, 'type', e.target.value)}
                                  className="select w-full"
                                >
                                  <option value="call">Call</option>
                                  <option value="put">Put</option>
                                </select>
                              </div>
                              
                              <div>
                                <label className="block text-xs text-neutral-400 mb-1">Action</label>
                                <select
                                  value={leg.action}
                                  onChange={(e) => updateLeg(leg.id, 'action', e.target.value)}
                                  className="select w-full"
                                >
                                  <option value="buy">Buy</option>
                                  <option value="sell">Sell</option>
                                </select>
                              </div>
                              
                              <div>
                                <label className="block text-xs text-neutral-400 mb-1">Quantity</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={leg.quantity}
                                  onChange={(e) => updateLeg(leg.id, 'quantity', parseInt(e.target.value) || 1)}
                                  className="input w-full"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-xs text-neutral-400 mb-1">Strike Price</label>
                                <input
                                  type="number"
                                  step="0.5"
                                  min="0.5"
                                  value={leg.strike}
                                  onChange={(e) => updateLeg(leg.id, 'strike', parseFloat(e.target.value) || 0)}
                                  className="input w-full"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-xs text-neutral-400 mb-1">Expiration</label>
                                <select
                                  value={leg.expiration}
                                  onChange={(e) => updateLeg(leg.id, 'expiration', e.target.value)}
                                  className="select w-full"
                                >
                                  {mockStrategies[0].legs[0].expiration && (
                                    <option value={mockStrategies[0].legs[0].expiration}>
                                      {new Date(mockStrategies[0].legs[0].expiration).toLocaleDateString()}
                                    </option>
                                  )}
                                </select>
                              </div>
                              
                              <div>
                                <label className="block text-xs text-neutral-400 mb-1">Option Price</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  value={leg.price}
                                  onChange={(e) => updateLeg(leg.id, 'price', parseFloat(e.target.value) || 0)}
                                  className="input w-full"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <div className="pt-3">
                          <button
                            className="btn-primary w-full"
                            onClick={saveStrategy}
                            disabled={newStrategy.legs.length === 0}
                          >
                            Save Strategy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {!createMode && (
              <>
                <div className="card">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Underlying Stock Price</h2>
                  </div>
                  
                  <div className="mb-4">
                    <input
                      type="range"
                      min={underlyingPrice * 0.7}
                      max={underlyingPrice * 1.3}
                      step={0.5}
                      value={underlyingPrice}
                      onChange={(e) => setUnderlyingPrice(parseFloat(e.target.value))}
                      className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400 text-sm">
                      {formatCurrency(underlyingPrice * 0.7)}
                    </span>
                    <span className="text-lg font-medium">
                      {formatCurrency(underlyingPrice)}
                    </span>
                    <span className="text-neutral-400 text-sm">
                      {formatCurrency(underlyingPrice * 1.3)}
                    </span>
                  </div>
                </div>
                
                <StrategyVisualizer 
                  strategy={selectedStrategy} 
                  underlyingPrice={underlyingPrice} 
                />
              </>
            )}
          </div>
        )}

        {/* Strategy Library Tab */}
        {activeTab === 'library' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Strategy Library</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allStrategies.map(strategy => (
                <div 
                  key={strategy.id}
                  className={`bg-neutral-750 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedStrategy.id === strategy.id
                      ? 'border-primary-500 bg-primary-900/20'
                      : 'border-transparent hover:border-neutral-600'
                  }`}
                  onClick={() => setSelectedStrategy(strategy)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{strategy.name}</h3>
                    {strategy.regime && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        strategy.regime === 'short-term' ? 'bg-error-900 text-error-400' :
                        strategy.regime === 'medium-term' ? 'bg-warning-900 text-warning-400' :
                        'bg-success-900 text-success-400'
                      }`}>
                        {strategy.regime}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-neutral-400 mb-3">{strategy.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-neutral-500">Max Profit:</span>
                      <p className="font-medium">
                        {typeof strategy.maxProfit === 'number' 
                          ? formatCurrency(strategy.maxProfit)
                          : strategy.maxProfit || 'Unlimited'
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-neutral-500">Max Loss:</span>
                      <p className="font-medium text-error-400">
                        {typeof strategy.maxLoss === 'number' 
                          ? formatCurrency(strategy.maxLoss)
                          : strategy.maxLoss || 'Limited'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {strategy.marketCondition && (
                    <div className="mt-2 pt-2 border-t border-neutral-600">
                      <span className="text-xs text-neutral-500">Best for: </span>
                      <span className="text-xs capitalize">{strategy.marketCondition} markets</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategyBuilder;