import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Stock, Option } from '../../types';

interface RealTimeDataContextType {
  isConnected: boolean;
  lastUpdate: Date | null;
  updateStock: (symbol: string, data: Partial<Stock>) => void;
  updateOption: (symbol: string, strike: number, expiration: string, type: 'call' | 'put', data: Partial<Option>) => void;
}

const RealTimeDataContext = createContext<RealTimeDataContextType | null>(null);

interface RealTimeDataProviderProps {
  children: ReactNode;
}

export const RealTimeDataProvider: React.FC<RealTimeDataProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Simulate WebSocket connection for real-time data
    const connectToDataFeed = () => {
      console.log('Connecting to real-time data feed...');
      
      // Simulate connection delay
      setTimeout(() => {
        setIsConnected(true);
        setLastUpdate(new Date());
        console.log('Connected to real-time data feed');
      }, 2000);

      // Simulate periodic updates
      const updateInterval = setInterval(() => {
        if (Math.random() > 0.1) { // 90% uptime simulation
          setLastUpdate(new Date());
          // Trigger price updates here
        } else {
          setIsConnected(false);
          setTimeout(() => setIsConnected(true), 5000); // Reconnect after 5s
        }
      }, 1000);

      return () => clearInterval(updateInterval);
    };

    const cleanup = connectToDataFeed();
    return cleanup;
  }, []);

  const updateStock = (symbol: string, data: Partial<Stock>) => {
    // In a real implementation, this would update the global state
    console.log(`Updating ${symbol}:`, data);
    setLastUpdate(new Date());
  };

  const updateOption = (symbol: string, strike: number, expiration: string, type: 'call' | 'put', data: Partial<Option>) => {
    // In a real implementation, this would update the global state
    console.log(`Updating ${symbol} ${strike} ${type} ${expiration}:`, data);
    setLastUpdate(new Date());
  };

  return (
    <RealTimeDataContext.Provider value={{
      isConnected,
      lastUpdate,
      updateStock,
      updateOption
    }}>
      {children}
    </RealTimeDataContext.Provider>
  );
};

export const useRealTimeData = () => {
  const context = useContext(RealTimeDataContext);
  if (!context) {
    throw new Error('useRealTimeData must be used within a RealTimeDataProvider');
  }
  return context;
};