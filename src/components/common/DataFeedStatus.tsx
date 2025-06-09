import React from 'react';
import { Wifi, WifiOff, Clock, Activity, AlertCircle } from 'lucide-react';
import { useRealTimeData } from './RealTimeDataProvider';

const DataFeedStatus: React.FC = () => {
  const { isConnected, lastUpdate, connectionStatus, subscriptionCount } = useRealTimeData();

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 5000) return 'Live';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return date.toLocaleTimeString();
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-success-400';
      case 'connecting': return 'text-warning-400';
      case 'disconnected': return 'text-error-400';
      case 'error': return 'text-error-500';
      default: return 'text-neutral-400';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <Wifi size={16} />;
      case 'connecting': return <Activity size={16} className="animate-pulse" />;
      case 'disconnected': return <WifiOff size={16} />;
      case 'error': return <AlertCircle size={16} />;
      default: return <WifiOff size={16} />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Polygon.io Live';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Disconnected';
      case 'error': return 'Connection Error';
      default: return 'Unknown';
    }
  };

  return (
    <div className="flex items-center space-x-3 text-sm">
      <div className={`flex items-center ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="ml-1">{getStatusText()}</span>
      </div>
      
      {isConnected && (
        <>
          <div className="flex items-center text-neutral-400">
            <Clock size={14} className="mr-1" />
            <span>{formatLastUpdate(lastUpdate)}</span>
          </div>
          
          {subscriptionCount > 0 && (
            <div className="flex items-center text-neutral-400">
              <Activity size={14} className="mr-1" />
              <span>{subscriptionCount} feeds</span>
            </div>
          )}
        </>
      )}
      
      {connectionStatus === 'error' && (
        <div className="text-xs text-error-400">
          Using demo data
        </div>
      )}
    </div>
  );
};

export default DataFeedStatus;