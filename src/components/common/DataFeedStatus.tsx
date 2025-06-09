import React from 'react';
import { Wifi, WifiOff, Clock } from 'lucide-react';
import { useRealTimeData } from './RealTimeDataProvider';

const DataFeedStatus: React.FC = () => {
  const { isConnected, lastUpdate } = useRealTimeData();

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className={`flex items-center ${isConnected ? 'text-success-400' : 'text-error-400'}`}>
        {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
        <span className="ml-1">{isConnected ? 'Live' : 'Disconnected'}</span>
      </div>
      <div className="flex items-center text-neutral-400">
        <Clock size={14} className="mr-1" />
        <span>{formatLastUpdate(lastUpdate)}</span>
      </div>
    </div>
  );
};

export default DataFeedStatus;