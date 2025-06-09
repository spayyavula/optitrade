import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Database features will be limited.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Database interfaces matching our schema
export interface DataSource {
  id: string;
  name: string;
  type: 'polygon_io' | 'mock' | 'simulated' | 'manual' | 'other';
  description?: string;
  is_real_time: boolean;
  is_mock: boolean;
  api_endpoint?: string;
  reliability_score: number;
  last_successful_connection?: string;
  created_at: string;
  updated_at: string;
}

export interface StockQuote {
  id: string;
  stock_id: string;
  data_source_id: string;
  symbol: string;
  bid?: number;
  ask?: number;
  last_price: number;
  volume: number;
  change_amount?: number;
  change_percent?: number;
  is_mock: boolean;
  is_real_time: boolean;
  market_session: 'pre_market' | 'regular' | 'after_hours' | 'closed';
  quote_timestamp: string;
  received_at: string;
  created_at: string;
}

export interface OptionQuote {
  id: string;
  contract_id: string;
  data_source_id: string;
  contract_symbol: string;
  bid?: number;
  ask?: number;
  last_price: number;
  volume: number;
  open_interest: number;
  implied_volatility?: number;
  delta?: number;
  gamma?: number;
  theta?: number;
  vega?: number;
  rho?: number;
  is_mock: boolean;
  is_real_time: boolean;
  market_session: 'pre_market' | 'regular' | 'after_hours' | 'closed';
  quote_timestamp: string;
  received_at: string;
  created_at: string;
}

export interface DataQualityMetric {
  id: string;
  data_source_id: string;
  metric_date: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  average_response_time_ms?: number;
  uptime_percentage?: number;
  mock_data_percentage?: number;
  last_connection_attempt?: string;
  connection_status: 'connected' | 'disconnected' | 'simulated' | 'error';
  error_details?: any;
  created_at: string;
  updated_at: string;
}

export class SupabaseService {
  // Store stock quote with data source tracking
  static async storeStockQuote(
    symbol: string,
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
    isRealTime: boolean = true,
    marketSession: 'pre_market' | 'regular' | 'after_hours' | 'closed' = 'regular'
  ): Promise<string | null> {
    try {
      // Get data source
      const { data: dataSource } = await supabase
        .from('data_sources')
        .select('id')
        .eq('name', dataSourceName)
        .single();

      if (!dataSource) {
        console.error(`Data source ${dataSourceName} not found`);
        return null;
      }

      // Get or create stock
      let { data: stock } = await supabase
        .from('stocks')
        .select('id')
        .eq('symbol', symbol)
        .single();

      if (!stock) {
        const { data: newStock } = await supabase
          .from('stocks')
          .insert({ symbol, name: `${symbol} Corporation` })
          .select('id')
          .single();
        stock = newStock;
      }

      if (!stock) {
        console.error(`Failed to get or create stock for ${symbol}`);
        return null;
      }

      // Insert quote
      const { data: quoteData, error } = await supabase
        .from('stock_quotes')
        .insert({
          stock_id: stock.id,
          data_source_id: dataSource.id,
          symbol,
          bid: quote.bid,
          ask: quote.ask,
          last_price: quote.last_price,
          volume: quote.volume,
          change_amount: quote.change_amount,
          change_percent: quote.change_percent,
          is_mock: isMock,
          is_real_time: isRealTime,
          market_session: marketSession,
          quote_timestamp: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error storing stock quote:', error);
        return null;
      }

      return quoteData?.id || null;
    } catch (error) {
      console.error('Error in storeStockQuote:', error);
      return null;
    }
  }

  // Get latest stock quote with data source info
  static async getLatestStockQuote(symbol: string): Promise<StockQuote | null> {
    try {
      const { data, error } = await supabase
        .from('stock_quotes')
        .select(`
          *,
          data_sources!inner(name, type, is_mock, is_real_time)
        `)
        .eq('symbol', symbol)
        .order('quote_timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching latest stock quote:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getLatestStockQuote:', error);
      return null;
    }
  }

  // Store option quote
  static async storeOptionQuote(
    contractSymbol: string,
    quote: {
      bid?: number;
      ask?: number;
      last_price: number;
      volume: number;
      open_interest: number;
      implied_volatility?: number;
      delta?: number;
      gamma?: number;
      theta?: number;
      vega?: number;
      rho?: number;
    },
    dataSourceName: string,
    isMock: boolean = false,
    isRealTime: boolean = true,
    marketSession: 'pre_market' | 'regular' | 'after_hours' | 'closed' = 'regular'
  ): Promise<string | null> {
    try {
      // Get data source
      const { data: dataSource } = await supabase
        .from('data_sources')
        .select('id')
        .eq('name', dataSourceName)
        .single();

      if (!dataSource) {
        console.error(`Data source ${dataSourceName} not found`);
        return null;
      }

      // Get contract
      const { data: contract } = await supabase
        .from('options_contracts')
        .select('id')
        .eq('contract_symbol', contractSymbol)
        .single();

      if (!contract) {
        console.error(`Options contract ${contractSymbol} not found`);
        return null;
      }

      // Insert quote
      const { data: quoteData, error } = await supabase
        .from('options_quotes')
        .insert({
          contract_id: contract.id,
          data_source_id: dataSource.id,
          contract_symbol: contractSymbol,
          bid: quote.bid,
          ask: quote.ask,
          last_price: quote.last_price,
          volume: quote.volume,
          open_interest: quote.open_interest,
          implied_volatility: quote.implied_volatility,
          delta: quote.delta,
          gamma: quote.gamma,
          theta: quote.theta,
          vega: quote.vega,
          rho: quote.rho,
          is_mock: isMock,
          is_real_time: isRealTime,
          market_session: marketSession,
          quote_timestamp: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error storing option quote:', error);
        return null;
      }

      return quoteData?.id || null;
    } catch (error) {
      console.error('Error in storeOptionQuote:', error);
      return null;
    }
  }

  // Update data quality metrics
  static async updateDataQualityMetrics(
    dataSourceName: string,
    metrics: {
      total_requests?: number;
      successful_requests?: number;
      failed_requests?: number;
      average_response_time_ms?: number;
      uptime_percentage?: number;
      mock_data_percentage?: number;
      connection_status?: 'connected' | 'disconnected' | 'simulated' | 'error';
      error_details?: any;
    }
  ): Promise<boolean> {
    try {
      // Get data source
      const { data: dataSource } = await supabase
        .from('data_sources')
        .select('id')
        .eq('name', dataSourceName)
        .single();

      if (!dataSource) {
        console.error(`Data source ${dataSourceName} not found`);
        return false;
      }

      const today = new Date().toISOString().split('T')[0];

      // Upsert metrics
      const { error } = await supabase
        .from('data_quality_metrics')
        .upsert({
          data_source_id: dataSource.id,
          metric_date: today,
          last_connection_attempt: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...metrics
        }, {
          onConflict: 'data_source_id,metric_date'
        });

      if (error) {
        console.error('Error updating data quality metrics:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateDataQualityMetrics:', error);
      return false;
    }
  }

  // Get data quality summary
  static async getDataQualitySummary(): Promise<DataQualityMetric[]> {
    try {
      const { data, error } = await supabase
        .from('data_quality_metrics')
        .select(`
          *,
          data_sources!inner(name, type, description, is_mock, is_real_time)
        `)
        .eq('metric_date', new Date().toISOString().split('T')[0])
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching data quality summary:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getDataQualitySummary:', error);
      return [];
    }
  }

  // Get historical quotes for charting
  static async getHistoricalQuotes(
    symbol: string,
    fromDate: string,
    toDate: string,
    dataSourceName?: string
  ): Promise<StockQuote[]> {
    try {
      let query = supabase
        .from('stock_quotes')
        .select(`
          *,
          data_sources!inner(name, type, is_mock)
        `)
        .eq('symbol', symbol)
        .gte('quote_timestamp', fromDate)
        .lte('quote_timestamp', toDate)
        .order('quote_timestamp', { ascending: true });

      if (dataSourceName) {
        query = query.eq('data_sources.name', dataSourceName);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching historical quotes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getHistoricalQuotes:', error);
      return [];
    }
  }

  // Check if data is mock/simulated
  static async isDataMocked(symbol: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('stock_quotes')
        .select('is_mock')
        .eq('symbol', symbol)
        .order('quote_timestamp', { ascending: false })
        .limit(1)
        .single();

      return data?.is_mock || false;
    } catch (error) {
      console.error('Error checking if data is mocked:', error);
      return false;
    }
  }
}