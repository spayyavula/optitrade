import React, { useState } from 'react';
import StrategyVisualizer from '../components/strategyBuilder/StrategyVisualizer';
import { mockStrategies, mockStocks } from '../data/mockData';
import { Strategy, StrategyLeg } from '../types';
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const StrategyBuilder: React.FC = () => {
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
      expiration: mockStrategies[0].legs[0].expiration, // Using first available expiration
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
    // This would normally save to a database
    // For demo purposes, we just add it to the displayed strategies
    const savedStrategy = {
      ...newStrategy,
      id: `strategy-${Date.now()}`,
      // For simplicity, we're not calculating these values
      maxProfit: 500,
      maxLoss: 500,
      breakEven: [underlyingPrice]
    };
    
    setSelectedStrategy(savedStrategy);
    setCreateMode(false);
  };
  
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">Options Strategy Builder</h1>
        
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Select Strategy</h2>
            <button 
              className="btn-primary"
              onClick={() => setCreateMode(!createMode)}
            >
              {createMode ? 'Cancel' : 'Create New Strategy'}
            </button>
          </div>
          
          {!createMode && (
            <div className="flex flex-wrap gap-3">
              {mockStrategies.map(strategy => (
                <button
                  key={strategy.id}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedStrategy.id === strategy.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                  }`}
                  onClick={() => setSelectedStrategy(strategy)}
                >
                  {strategy.name}
                </button>
              ))}
            </div>
          )}
          
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
          <div className="card mb-6">
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
        )}
        
        {!createMode && (
          <StrategyVisualizer 
            strategy={selectedStrategy} 
            underlyingPrice={underlyingPrice} 
          />
        )}
      </div>
    </div>
  );
};

export default StrategyBuilder;