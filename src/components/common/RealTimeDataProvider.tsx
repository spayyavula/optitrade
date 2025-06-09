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
    let updateInterval: NodeJS.Timeout;
    let reconnectTimeout: NodeJS.Timeout;

    // Simulate WebSocket connection for real-time data
    const connectToDataFeed = () => {
      try {
        console.log('Connecting to real-time data feed...');
        
        // Simulate connection delay
        const connectionTimeout = setTimeout(() => {
          setIsConnected(true);
          setLastUpdate(new Date());
          console.log('Connected to real-time data feed');
        }, 2000);

        // Simulate periodic updates
        updateInterval = setInterval(() => {
          try {
            if (Math.random() > 0.1) { // 90% uptime simulation
              setLastUpdate(new Date());
              // Trigger price updates here
            } else {
              console.log('Simulating connection loss...');
              setIsConnected(false);
              reconnectTimeout = setTimeout(() => {
                console.log('Reconnecting...');
                setIsConnected(true);
              }, 5000); // Reconnect after 5s
            }
          } catch (error) {
            console.error('Error in data update interval:', error);
          }
        }, 1000);

        return () => {
          clearTimeout(connectionTimeout);
          clearInterval(updateInterval);
          clearTimeout(reconnectTimeout);
        };
      } catch (error) {
        console.error('Error setting up data feed connection:', error);
        return () => {};
      }
    };

    const cleanup = connectToDataFeed();
    
    return () => {
      cleanup();
      if (updateInterval) clearInterval(updateInterval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  const updateStock = (symbol: string, data: Partial<Stock>) => {
    try {
      // In a real implementation, this would update the global state
      console.log(`Updating ${symbol}:`, data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error updating stock data:', error);
    }
  };

  const updateOption = (symbol: string, strike: number, expiration: string, type: 'call' | 'put', data: Partial<Option>) => {
    try {
      // In a real implementation, this would update the global state
      console.log(`Updating ${symbol} ${strike} ${type} ${expiration}:`, data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error updating option data:', error);
    }
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