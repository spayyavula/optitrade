import { useState, useEffect } from 'react';
import { SupabaseService, StockQuote, DataQualityMetric } from '../services/supabaseService';

export interface UseSupabaseDataOptions {
  symbol?: string;
  autoStore?: boolean;
}

export interface SupabaseDataState {
  latestQuote: StockQuote | null;
  dataQuality: DataQualityMetric[];
  isDataMocked: boolean;
  loading: boolean;
  error: string | null;
  isSupabaseAvailable: boolean;
}

export const useSupabaseData = ({ symbol, autoStore = true }: UseSupabaseDataOptions = {}) => {
  const [state, setState] = useState<SupabaseDataState>({
    latestQuote: null,
    dataQuality: [],
    isDataMocked: false,
    loading: true,
    error: null,
    isSupabaseAvailable: SupabaseService.isAvailable()
  });

  // Store quote data to Supabase
  const storeQuote = async (
    quoteSymbol: string,
    quote: {
      bid?: number;
      ask?: number;
      last_price: number;
      volume: number;
      change_amount?: number;
      change_percent?: number;
    },
    dataSourceName: string,
    isMock: boolean = false,
    isRealTime: boolean = true
  ) => {
    if (!SupabaseService.isAvailable()) {
      console.warn('Supabase not available - quote not stored');
      return null;
    }

    try {
      const quoteId = await SupabaseService.storeStockQuote(
        quoteSymbol,
        quote,
        dataSourceName,
        isMock,
        isRealTime
      );
      
      if (quoteId) {
        console.log(`Stored quote for ${quoteSymbol} with ID: ${quoteId}`);
        
        // Update data quality metrics
        await SupabaseService.updateDataQualityMetrics(dataSourceName, {
          total_requests: 1,
          successful_requests: 1,
          connection_status: isMock ? 'simulated' : 'connected',
          mock_data_percentage: isMock ? 100 : 0
        });
      }
      
      return quoteId;
    } catch (error) {
      console.error('Error storing quote:', error);
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Unknown error' }));
      return null;
    }
  };

  // Fetch latest quote from database
  const fetchLatestQuote = async (quoteSymbol: string) => {
    if (!SupabaseService.isAvailable()) {
      setState(prev => ({ 
        ...prev, 
        loading: false,
        error: 'Supabase not configured'
      }));
      return null;
    }

    try {
      const quote = await SupabaseService.getLatestStockQuote(quoteSymbol);
      setState(prev => ({ 
        ...prev, 
        latestQuote: quote,
        isDataMocked: quote?.is_mock || false,
        loading: false,
        error: null
      }));
      return quote;
    } catch (error) {
      console.error('Error fetching latest quote:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      }));
      return null;
    }
  };

  // Fetch data quality summary
  const fetchDataQuality = async () => {
    if (!SupabaseService.isAvailable()) {
      setState(prev => ({ ...prev, dataQuality: [] }));
      return [];
    }

    try {
      const quality = await SupabaseService.getDataQualitySummary();
      setState(prev => ({ ...prev, dataQuality: quality }));
      return quality;
    } catch (error) {
      console.error('Error fetching data quality:', error);
      return [];
    }
  };

  // Update connection status
  const updateConnectionStatus = async (
    dataSourceName: string,
    status: 'connected' | 'disconnected' | 'simulated' | 'error',
    errorDetails?: any
  ) => {
    if (!SupabaseService.isAvailable()) {
      console.warn('Supabase not available - connection status not updated');
      return;
    }

    try {
      await SupabaseService.updateDataQualityMetrics(dataSourceName, {
        connection_status: status,
        error_details: errorDetails,
        last_connection_attempt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating connection status:', error);
    }
  };

  useEffect(() => {
    if (symbol && SupabaseService.isAvailable()) {
      fetchLatestQuote(symbol);
    } else {
      setState(prev => ({ ...prev, loading: false }));
    }
    
    if (SupabaseService.isAvailable()) {
      fetchDataQuality();
    }
  }, [symbol]);

  return {
    ...state,
    storeQuote,
    fetchLatestQuote,
    fetchDataQuality,
    updateConnectionStatus,
    refresh: () => {
      if (symbol && SupabaseService.isAvailable()) {
        fetchLatestQuote(symbol);
      }
      if (SupabaseService.isAvailable()) {
        fetchDataQuality();
      }
    }
  };
};

// Hook for data quality monitoring
export const useDataQualityMonitor = () => {
  const [metrics, setMetrics] = useState<DataQualityMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSupabaseAvailable] = useState(SupabaseService.isAvailable());

  const refreshMetrics = async () => {
    if (!isSupabaseAvailable) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await SupabaseService.getDataQualitySummary();
      setMetrics(data);
    } catch (error) {
      console.error('Error refreshing data quality metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSupabaseAvailable) {
      refreshMetrics();
      
      // Refresh every 30 seconds
      const interval = setInterval(refreshMetrics, 30000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [isSupabaseAvailable]);

  return {
    metrics,
    loading,
    isSupabaseAvailable,
    refresh: refreshMetrics
  };
};