import React from 'react';
import { Clock, ArrowDownToLine, ArrowUpToLine } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

// Mock activity data
const activities = [
  {
    id: '1',
    type: 'buy',
    symbol: 'AAPL',
    details: 'Buy to Open 2 AAPL 175 Call @ 4.25',
    date: '2023-07-01',
    amount: -850
  },
  {
    id: '2',
    type: 'sell',
    symbol: 'MSFT',
    details: 'Sell to Close 1 MSFT 400 Put @ 7.35',
    date: '2023-06-29',
    amount: 735
  },
  {
    id: '3',
    type: 'deposit',
    details: 'Deposit from Bank ****1234',
    date: '2023-06-25',
    amount: 5000
  },
  {
    id: '4',
    type: 'buy',
    symbol: 'TSLA',
    details: 'Buy 10 TSLA @ 165.30',
    date: '2023-06-20',
    amount: -1653
  },
  {
    id: '5',
    type: 'dividend',
    symbol: 'SPY',
    details: 'Dividend Payment',
    date: '2023-06-15',
    amount: 127.50
  }
];

const RecentActivity: React.FC = () => {
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
        <button className="text-sm text-primary-400 hover:text-primary-300">View All</button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div 
            key={activity.id} 
            className="flex items-start justify-between p-3 rounded-lg hover:bg-neutral-750 transition-colors"
          >
            <div className="flex items-start">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                activity.type === 'buy' ? 'bg-error-900 text-error-400' : 
                activity.type === 'sell' ? 'bg-success-900 text-success-400' :
                'bg-primary-900 text-primary-400'
              }`}>
                {activity.type === 'buy' && <ArrowDownToLine size={18} />}
                {activity.type === 'sell' && <ArrowUpToLine size={18} />}
                {activity.type !== 'buy' && activity.type !== 'sell' && <Clock size={18} />}
              </div>
              <div>
                <p className="font-medium">
                  {activity.symbol && <span className="mr-2">{activity.symbol}</span>}
                  {activity.details}
                </p>
                <p className="text-sm text-neutral-400 flex items-center">
                  <Clock size={14} className="mr-1" />
                  {formatDate(activity.date)}
                </p>
              </div>
            </div>
            <div className={`font-medium ${activity.amount >= 0 ? 'text-success-400' : 'text-error-400'}`}>
              {formatCurrency(activity.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;