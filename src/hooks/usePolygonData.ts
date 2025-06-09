import { useState, useEffect, useCallback } from 'react';
import { polygonService, PolygonQuote, PolygonOptionQuote } from '../services/polygonService';

export interface UsePolygonDataOptions {
  symbol: string;
  autoSubscribe?: boolean;
  includeOptions?: boolean;
}

export interface PolygonDataState {
  quote: PolygonQuote | null;
  options: PolygonOptionQuote[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

export const usePolygonData = ({ symbol, autoSubscribe = true, includeOptions = false }: UsePolygonDataOptions) => {
  const [state, setState] = useState<PolygonDataState>({
    quote: null,
    options: [],
    loading: true,
    error: null,
    lastUpdate: null
  });

  const updateQuote = useCallback((newQuote: PolygonQuote) => {
    setState(prev => ({
      ...prev,
      quote: newQuote,
      lastUpdate: new Date(),
      loading: false,
      error: null
    }));
  }, []);

  const updateOptions = useCallback((newOption: PolygonOptionQuote) => {
    setState(prev => ({
      ...prev,
      options: prev.options.map(opt => 
        opt.symbol === newOption.symbol ? newOption : opt
      ).concat(prev.options.find(opt => opt.symbol === newOption.symbol) ? [] : [newOption]),
      lastUpdate: new Date(),
      loading: false,
      error: null
    }));
  }, []);

  const fetchInitialData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Fetch initial quote
      const quote = await polygonService.getStockQuote(symbol);
      if (quote) {
        setState(prev => ({ ...prev, quote, lastUpdate: new Date() }));
      }

      // Fetch options chain if requested
      if (includeOptions) {
        const options = await polygonService.getOptionsChain(symbol);
        setState(prev => ({ ...prev, options, lastUpdate: new Date() }));
      }

      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
    }
  }, [symbol, includeOptions]);

  const subscribe = useCallback(() => {
    if (!autoSubscribe) return;

    try {
      // Subscribe to real-time quotes
      polygonService.subscribeToQuotes([symbol], updateQuote);

      // Subscribe to options if requested
      if (includeOptions) {
        polygonService.subscribeToOptionQuotes([symbol], updateOptions);
      }
    } catch (error) {
      console.error(`Error subscribing to ${symbol}:`, error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Subscription error' 
      }));
    }
  }, [symbol, autoSubscribe, includeOptions, updateQuote, updateOptions]);

  const unsubscribe = useCallback(() => {
    try {
      polygonService.unsubscribe(symbol, 'quote');
      if (includeOptions) {
        polygonService.unsubscribe(symbol, 'option');
      }
    } catch (error) {
      console.error(`Error unsubscribing from ${symbol}:`, error);
    }
  }, [symbol, includeOptions]);

  const refresh = useCallback(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    fetchInitialData();
    subscribe();

    return () => {
      unsubscribe();
    };
  }, [fetchInitialData, subscribe, unsubscribe]);

  return {
    ...state,
    refresh,
    subscribe: () => subscribe(),
    unsubscribe: () => unsubscribe()
  };
};

// Hook for multiple symbols
export const usePolygonMultiData = (symbols: string[]) => {
  const [quotes, setQuotes] = useState<Map<string, PolygonQuote>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateQuote = useCallback((quote: PolygonQuote) => {
    setQuotes(prev => new Map(prev.set(quote.symbol, quote)));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch initial quotes for all symbols
        const quotePromises = symbols.map(symbol => polygonService.getStockQuote(symbol));
        const results = await Promise.allSettled(quotePromises);
        
        const newQuotes = new Map<string, PolygonQuote>();
        results.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            newQuotes.set(symbols[index], result.value);
          }
        });
        
        setQuotes(newQuotes);
        
        // Subscribe to real-time updates
        polygonService.subscribeToQuotes(symbols, updateQuote);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (symbols.length > 0) {
      fetchData();
    }

    return () => {
      symbols.forEach(symbol => {
        polygonService.unsubscribe(symbol, 'quote');
      });
    };
  }, [symbols, updateQuote]);

  return {
    quotes: Object.fromEntries(quotes),
    loading,
    error
  };
};