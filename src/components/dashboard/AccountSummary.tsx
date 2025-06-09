import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { mockUser } from '../../data/mockData';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

const AccountSummary: React.FC = () => {
  // Random daily change for demonstration
  const dailyChange = Math.random() > 0.5 
    ? Math.random() * 500 
    : -Math.random() * 500;
  
  const dailyPercentChange = (dailyChange / mockUser.accountValue) * 100;
  
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Account Summary</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-1 rounded bg-neutral-700">
            DEMO ACCOUNT
          </span>
          <div className="flex items-center text-xs text-warning-400">
            <AlertTriangle size={14} className="mr-1" />
            <span>Educational Only</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
        <div className="flex flex-col">
          <span className="text-sm text-neutral-400 mb-1">Account Value</span>
          <span className="text-2xl font-semibold">{formatCurrency(mockUser.accountValue)}</span>
          <div className={`flex items-center text-sm mt-1 ${dailyChange >= 0 ? 'text-success-400' : 'text-error-400'}`}>
            {dailyChange >= 0 ? (
              <TrendingUp size={16} className="mr-1" />
            ) : (
              <TrendingDown size={16} className="mr-1" />
            )}
            <span>{formatCurrency(dailyChange)} ({dailyPercentChange.toFixed(2)}%)</span>
          </div>
        </div>
        
        <div className="flex flex-col">
          <span className="text-sm text-neutral-400 mb-1">Buying Power</span>
          <span className="text-2xl font-semibold">{formatCurrency(mockUser.buyingPower)}</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-sm text-neutral-400 mb-1">Cash Balance</span>
          <span className="text-2xl font-semibold">{formatCurrency(mockUser.cashBalance)}</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-sm text-neutral-400 mb-1">Margin Used</span>
          <span className="text-2xl font-semibold">{formatCurrency(mockUser.accountValue - mockUser.cashBalance)}</span>
        </div>
      </div>
      
      <div className="bg-warning-900 border border-warning-700 p-3 rounded-lg mb-4">
        <p className="text-warning-200 text-sm">
          <strong>Demo Account:</strong> All values are simulated for educational purposes. 
          This is not a real trading account.
        </p>
      </div>
      
      <div className="flex justify-between">
        <button className="btn-ghost" disabled>
          Deposit Funds (Demo)
        </button>
        <button className="btn-ghost" disabled>
          View Statement (Demo)
        </button>
      </div>
    </div>
  );
};

export default AccountSummary;