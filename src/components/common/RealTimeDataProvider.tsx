import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Stock, Option } from '../../types';
import { polygonService, PolygonQuote, PolygonOptionQuote } from '../../services/polygonService';
import { useSupabaseData } from '../../hooks/useSupabaseData';

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
  console.log('RealTimeDataProvider rendering with Polygon.io and Supabase integration');
  
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error' | 'simulated'>('connecting');
  const [subscriptionCount, setSubscriptionCount] = useState(0);
  const [isLiveConnection, setIsLiveConnection] = useState(false);
  const [isSimulatedData, setIsSimulatedData] = useState(false);
  const [lastEODPrice, setLastEODPrice] = useState<number | null>(null);

  // Initialize Supabase integration
  const { storeQuote, updateConnectionStatus } = useSupabaseData({ autoStore: true });

  useEffect(() => {
    console.log('RealTimeDataProvider useEffect starting - connecting to Polygon.io with Supabase tracking');
    
    let reconnectTimeout: NodeJS.Timeout;
    let statusCheckInterval: NodeJS.Timeout;

    const connectToPolygon = async () => {
      try {
        setConnectionStatus('connecting');
        setIsLiveConnection(false);
        setIsSimulatedData(false);
        console.log('Connecting to Polygon.io WebSocket...');
        
        // Update Supabase with connection attempt
        await updateConnectionStatus('polygon_io', 'connecting');
        
        await polygonService.connect();
        
        // Check if we have a real WebSocket connection
        const isRealConnection = polygonService.isConnectedToStream();
        const isMockMode = polygonService.isMockModeEnabled();
        
        if (isRealConnection && !isMockMode) {
          setIsConnected(true);
          setConnectionStatus('connected');
          setIsLiveConnection(true);
          setIsSimulatedData(false);
          setLastUpdate(new Date());
          console.log('Successfully connected to Polygon.io live stream');
          
          // Update Supabase with successful connection
          await updateConnectionStatus('polygon_io', 'connected');
        } else {
          // We're using simulated data
          setIsConnected(true);
          setConnectionStatus('simulated');
          setIsLiveConnection(false);
          setIsSimulatedData(true);
          setLastUpdate(new Date());
          console.log('Using simulated data - WebSocket connection failed or market closed');
          
          // Update Supabase with simulated status
          await updateConnectionStatus('simulated_realtime', 'simulated');
        }
        
        // Subscribe to some default symbols for demo
        const defaultSymbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA'];
        polygonService.subscribeToQuotes(defaultSymbols, async (quote) => {
          console.log('Received quote update:', quote);
          setLastUpdate(new Date());
          
          // Store quote in Supabase with proper data source tracking
          const dataSourceName = isMockMode ? 'simulated_realtime' : 'polygon_io';
          await storeQuote(
            quote.symbol,
            {
              bid: quote.bid,
              ask: quote.ask,
              last_price: quote.last,
              volume: quote.volume
            },
            dataSourceName,
            isMockMode,
            !isMockMode
          );
        });
        
        // Subscribe to AAPL options for demo
        polygonService.subscribeToOptionQuotes(['AAPL'], (optionQuote) => {
          console.log('Received option quote update:', optionQuote);
          setLastUpdate(new Date());
          // Note: Option quotes would also be stored in Supabase in a production system
        });
        
      } catch (error) {
        // Check if the service has fallen back to simulated data
        const isServiceConnected = polygonService.isConnectedToStream();
        const isMockMode = polygonService.isMockModeEnabled();
        
        if (isServiceConnected || isMockMode) {
          // Successfully using simulated data - this is not an error, just a fallback
          console.info('Market is closed or WebSocket connection timed out - using simulated data for demonstration');
          setIsConnected(true);
          setConnectionStatus('simulated');
          setIsLiveConnection(false);
          setIsSimulatedData(true);
          setLastUpdate(new Date());
          
          // Update Supabase with simulated status
          await updateConnectionStatus('simulated_realtime', 'simulated', {
            reason: 'Market closed or connection timeout',
            fallback_mode: true
          });
          
          // Subscribe to some default symbols for demo with simulated data
          const defaultSymbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA'];
          polygonService.subscribeToQuotes(defaultSymbols, async (quote) => {
            console.log('Received simulated quote update:', quote);
            setLastUpdate(new Date());
            
            // Store simulated quote in Supabase
            await storeQuote(
              quote.symbol,
              {
                bid: quote.bid,
                ask: quote.ask,
                last_price: quote.last,
                volume: quote.volume
              },
              'simulated_realtime',
              true, // is_mock
              true  // is_real_time (simulated real-time)
            );
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
          
          // Update Supabase with error status
          await updateConnectionStatus('polygon_io', 'error', {
            error_message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          });
          
          // Try to fetch last EOD price for AAPL as fallback
          try {
            const eodQuote = await polygonService.getStockQuote('AAPL');
            if (eodQuote && eodQuote.last) {
              setLastEODPrice(eodQuote.last);
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
        
        // Update Supabase with disconnection
        updateConnectionStatus('polygon_io', 'disconnected', {
          reason: 'Connection lost',
          timestamp: new Date().toISOString()
        });
        
        connectToPolygon();
      } else if (connected && !isLiveConnection && connectionStatus !== 'simulated') {
        // Check if we've regained live connection
        setIsConnected(true);
        setConnectionStatus('connected');
        setIsLiveConnection(true);
        setIsSimulatedData(false);
        
        // Update Supabase with reconnection
        updateConnectionStatus('polygon_io', 'connected');
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
  }, [storeQuote, updateConnectionStatus]);

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

  console.log('RealTimeDataProvider providing context with Polygon.io and Supabase integration');

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