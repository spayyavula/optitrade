import React from 'react';
import AccountSummary from '../components/dashboard/AccountSummary';
import MarketOverview from '../components/dashboard/MarketOverview';
import RecentActivity from '../components/dashboard/RecentActivity';
import WatchlistWidget from '../components/dashboard/WatchlistWidget';
import PriceChart from '../components/common/PriceChart';
import StockPrice from '../components/common/StockPrice';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import DataQualityWidget from '../components/common/DataQualityWidget';
import { mockAAPLData, mockStocks } from '../data/mockData';

const Dashboard: React.FC = () => {
  const appleStock = mockStocks.find(stock => stock.symbol === 'AAPL');
  
  return (
    <div className="animate-fade-in">
      <DisclaimerBanner />
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <AccountSummary />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 card">
          <div className="mb-4 flex justify-between items-center">
            <div>
              {appleStock && (
                <StockPrice 
                  symbol={appleStock.symbol}
                  price={appleStock.price}
                  change={appleStock.change}
                  percentChange={appleStock.percentChange}
                  animated
                />
              )}
            </div>
            <div className="flex space-x-1 bg-neutral-700 p-1 rounded-lg">
              <button className="text-xs py-1 px-2 rounded-md bg-neutral-600 text-white">1D</button>
              <button className="text-xs py-1 px-2 rounded-md text-neutral-400 hover:bg-neutral-600/50">1W</button>
              <button className="text-xs py-1 px-2 rounded-md text-neutral-400 hover:bg-neutral-600/50">1M</button>
              <button className="text-xs py-1 px-2 rounded-md text-neutral-400 hover:bg-neutral-600/50">3M</button>
              <button className="text-xs py-1 px-2 rounded-md text-neutral-400 hover:bg-neutral-600/50">1Y</button>
              <button className="text-xs py-1 px-2 rounded-md text-neutral-400 hover:bg-neutral-600/50">ALL</button>
            </div>
          </div>
          <PriceChart data={mockAAPLData} />
        </div>
        <div>
          <WatchlistWidget />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <MarketOverview />
        <RecentActivity />
      </div>
      
      {/* Data Quality Monitoring */}
      <div className="grid grid-cols-1 gap-6">
        <DataQualityWidget />
      </div>
    </div>
  );
};

export default Dashboard;