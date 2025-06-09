import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Stock, Option } from '../../types';
import { polygonService, PolygonQuote, PolygonOptionQuote } from '../../services/polygonService';

interface RealTimeDataContextType {
  isConnected: boolean;
  lastUpdate: Date | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error' | 'simulated';
  subscriptionCount: number;
  isLiveConnection: boolean;
  isSimulatedData: boolean;
  lastEODPrice: number | null;
  updateStock: (symbol: string, data: Partial<Stock>) => void;
  updateOption: (symbol: string, strike: number, expiration: string, type: 'call' | 'put', data: Partial<Option>) => void;
  subscribeToStock: (symbol: string, callback: (data: PolygonQuote) => void) => void;
  subscribeToOption: (symbol: string, callback: (data: PolygonOptionQuote) => void) => void;
  unsubscribeFromStock: (symbol: string) => void;
  unsubscribeFromOption: (symbol: string) => void;
}

const RealTimeDataContext = createContext<RealTimeDataContextType | null>(null);

interface RealTimeDataProviderProps {
  children: ReactNode;
}

export const RealTimeDataProvider: React.FC<RealTimeDataProviderProps> = ({ children }) => {
  console.log('RealTimeDataProvider rendering with Polygon.io integration');
  
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error' | 'simulated'>('connecting');
  const [subscriptionCount, setSubscriptionCount] = useState(0);
  const [isLiveConnection, setIsLiveConnection] = useState(false);
  const [isSimulatedData, setIsSimulatedData] = useState(false);
  const [lastEODPrice, setLastEODPrice] = useState<number | null>(null);

  useEffect(() => {
    console.log('RealTimeDataProvider useEffect starting - connecting to Polygon.io');
    
    let reconnectTimeout: NodeJS.Timeout;
    let statusCheckInterval: NodeJS.Timeout;

    const connectToPolygon = async () => {
      try {
        setConnectionStatus('connecting');
        setIsLiveConnection(false);
        setIsSimulatedData(false);
        console.log('Connecting to Polygon.io WebSocket...');
        
        await polygonService.connect();
        
        // Check if we have a real WebSocket connection
        const isRealConnection = polygonService.isConnectedToStream();
        
        if (isRealConnection) {
          setIsConnected(true);
          setConnectionStatus('connected');
          setIsLiveConnection(true);
          setIsSimulatedData(false);
          setLastUpdate(new Date());
          console.log('Successfully connected to Polygon.io live stream');
        } else {
          // We're using simulated data
          setIsConnected(true);
          setConnectionStatus('simulated');
          setIsLiveConnection(false);
          setIsSimulatedData(true);
          setLastUpdate(new Date());
          console.log('Using simulated data - WebSocket connection failed or market closed');
        }
        
        // Subscribe to some default symbols for demo
        const defaultSymbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA'];
        polygonService.subscribeToQuotes(defaultSymbols, (quote) => {
          console.log('Received quote update:', quote);
          setLastUpdate(new Date());
        });
        
        // Subscribe to AAPL options for demo
        polygonService.subscribeToOptionQuotes(['AAPL'], (optionQuote) => {
          console.log('Received option quote update:', optionQuote);
          setLastUpdate(new Date());
        });
        
      } catch (error) {
        // Check if the service has fallen back to simulated data
        const isServiceConnected = polygonService.isConnectedToStream();
        
        if (isServiceConnected) {
          // Successfully using simulated data - this is not an error, just a fallback
          console.info('Market is closed or WebSocket connection timed out - using simulated data for demonstration');
          setIsConnected(true);
          setConnectionStatus('simulated');
          setIsLiveConnection(false);
          setIsSimulatedData(true);
          setLastUpdate(new Date());
          
          // Subscribe to some default symbols for demo with simulated data
          const defaultSymbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA'];
          polygonService.subscribeToQuotes(defaultSymbols, (quote) => {
            console.log('Received simulated quote update:', quote);
            setLastUpdate(new Date());
          });
          
          // Subscribe to AAPL options for demo with simulated data
          polygonService.subscribeToOptionQuotes(['AAPL'], (optionQuote) => {
            console.log('Received simulated option quote update:', optionQuote);
            setLastUpdate(new Date());
          });
        } else {
          // Complete failure - this is a real error
          console.error('Failed to connect to Polygon.io and unable to fall back to simulated data:', error);
          setIsConnected(false);
          setConnectionStatus('error');
          setIsLiveConnection(false);
          setIsSimulatedData(false);
          
          // Try to fetch last EOD price for AAPL as fallback
          try {
            const eodData = await polygonService.getLastQuote('AAPL');
            if (eodData && eodData.last && eodData.last.price) {
              setLastEODPrice(eodData.last.price);
            }
          } catch (eodError) {
            console.error('Failed to fetch EOD price:', eodError);
          }
          
          // Retry connection after 10 seconds
          reconnectTimeout = setTimeout(() => {
            console.log('Retrying Polygon.io connection...');
            connectToPolygon();
          }, 10000);
        }
      }
    };

    // Check connection status periodically
    statusCheckInterval = setInterval(() => {
      const connected = polygonService.isConnectedToStream();
      const subCount = polygonService.getSubscriptionCount();
      
      setSubscriptionCount(subCount);
      
      if (!connected && connectionStatus === 'connected') {
        setConnectionStatus('disconnected');
        setIsLiveConnection(false);
        console.log('Polygon.io connection lost, attempting to reconnect...');
        connectToPolygon();
      } else if (connected && !isLiveConnection && connectionStatus !== 'simulated') {
        // Check if we've regained live connection
        setIsConnected(true);
        setConnectionStatus('connected');
        setIsLiveConnection(true);
        setIsSimulatedData(false);
      }
    }, 5000);

    // Initial connection
    connectToPolygon();
    
    return () => {
      console.log('RealTimeDataProvider cleanup - disconnecting from Polygon.io');
      clearTimeout(reconnectTimeout);
      clearInterval(statusCheckInterval);
      polygonService.disconnect();
    };
  }, []);

  const updateStock = (symbol: string, data: Partial<Stock>) => {
    try {
      console.log(`Updating ${symbol}:`, data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error updating stock data:', error);
    }
  };

  const updateOption = (symbol: string, strike: number, expiration: string, type: 'call' | 'put', data: Partial<Option>) => {
    try {
      console.log(`Updating ${symbol} ${strike} ${type} ${expiration}:`, data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error updating option data:', error);
    }
  };

  const subscribeToStock = (symbol: string, callback: (data: PolygonQuote) => void) => {
    try {
      console.log(`Subscribing to stock quotes for ${symbol}`);
      polygonService.subscribeToQuotes([symbol], callback);
      setSubscriptionCount(polygonService.getSubscriptionCount());
    } catch (error) {
      console.error(`Error subscribing to ${symbol}:`, error);
    }
  };

  const subscribeToOption = (symbol: string, callback: (data: PolygonOptionQuote) => void) => {
    try {
      console.log(`Subscribing to option quotes for ${symbol}`);
      polygonService.subscribeToOptionQuotes([symbol], callback);
      setSubscriptionCount(polygonService.getSubscriptionCount());
    } catch (error) {
      console.error(`Error subscribing to options for ${symbol}:`, error);
    }
  };

  const unsubscribeFromStock = (symbol: string) => {
    try {
      console.log(`Unsubscribing from stock quotes for ${symbol}`);
      polygonService.unsubscribe(symbol, 'quote');
      setSubscriptionCount(polygonService.getSubscriptionCount());
    } catch (error) {
      console.error(`Error unsubscribing from ${symbol}:`, error);
    }
  };

  const unsubscribeFromOption = (symbol: string) => {
    try {
      console.log(`Unsubscribing from option quotes for ${symbol}`);
      polygonService.unsubscribe(symbol, 'option');
      setSubscriptionCount(polygonService.getSubscriptionCount());
    } catch (error) {
      console.error(`Error unsubscribing from options for ${symbol}:`, error);
    }
  };

  console.log('RealTimeDataProvider providing context with Polygon.io integration');

  return (
    <RealTimeDataContext.Provider value={{
      isConnected,
      lastUpdate,
      connectionStatus,
      subscriptionCount,
      isLiveConnection,
      isSimulatedData,
      lastEODPrice,
      updateStock,
      updateOption,
      subscribeToStock,
      subscribeToOption,
      unsubscribeFromStock,
      unsubscribeFromOption
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