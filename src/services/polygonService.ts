import { restClient, websocketClient } from '@polygon.io/client-js';

export interface PolygonQuote {
  symbol: string;
  bid: number;
  ask: number;
  last: number;
  volume: number;
  timestamp: number;
}

export interface PolygonOptionQuote extends PolygonQuote {
  strike: number;
  expiration: string;
  type: 'call' | 'put';
  impliedVolatility?: number;
  delta?: number;
  gamma?: number;
  theta?: number;
  vega?: number;
}

export interface PolygonTrade {
  symbol: string;
  price: number;
  size: number;
  timestamp: number;
  conditions?: number[];
}

class PolygonService {
  private restClient: any;
  private wsClient: any;
  private apiKey: string;
  private isConnected: boolean = false;
  private subscriptions: Set<string> = new Set();
  private callbacks: Map<string, Function[]> = new Map();
  private connectionPromise: Promise<void> | null = null;
  private resolveConnection: (() => void) | null = null;
  private rejectConnection: ((error: any) => void) | null = null;

  constructor() {
    // In production, this should come from environment variables
    this.apiKey = import.meta.env.VITE_POLYGON_API_KEY || 'demo_key';
    
    if (this.apiKey === 'demo_key') {
      console.warn('Using demo Polygon.io key. Real-time data will be simulated.');
      this.initializeMockService();
    } else {
      this.initializePolygonClients();
    }
  }

  private initializePolygonClients() {
    try {
      this.restClient = restClient(this.apiKey);
      this.wsClient = websocketClient(this.apiKey);
      
      this.wsClient.onopen = () => {
        console.log('Polygon WebSocket connected');
        this.isConnected = true;
        
        // Resolve any pending connection promise
        if (this.resolveConnection) {
          this.resolveConnection();
          this.resolveConnection = null;
          this.rejectConnection = null;
        }
      };

      this.wsClient.onclose = () => {
        console.log('Polygon WebSocket disconnected');
        this.isConnected = false;
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.connect(), 5000);
      };

      this.wsClient.onerror = (error: any) => {
        console.error('Polygon WebSocket error:', error);
        
        // Reject any pending connection promise
        if (this.rejectConnection) {
          this.rejectConnection(error);
          this.resolveConnection = null;
          this.rejectConnection = null;
        }
      };

      this.wsClient.onmessage = (message: any) => {
        this.handleWebSocketMessage(message);
      };

    } catch (error) {
      console.error('Failed to initialize Polygon clients:', error);
      this.initializeMockService();
    }
  }

  private initializeMockService() {
    console.log('Initializing mock Polygon service for demo purposes');
    this.isConnected = true;
    
    // Simulate real-time updates every 1-3 seconds
    setInterval(() => {
      this.simulateMarketData();
    }, Math.random() * 2000 + 1000);
  }

  private simulateMarketData() {
    // Simulate stock quotes
    const stocks = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN'];
    stocks.forEach(symbol => {
      if (this.subscriptions.has(`Q.${symbol}`)) {
        const mockQuote: PolygonQuote = {
          symbol,
          bid: 175 + Math.random() * 10 - 5,
          ask: 175 + Math.random() * 10 - 4.5,
          last: 175 + Math.random() * 10 - 4.75,
          volume: Math.floor(Math.random() * 1000000),
          timestamp: Date.now()
        };
        this.notifyCallbacks(`quote.${symbol}`, mockQuote);
      }
    });

    // Simulate option quotes
    this.subscriptions.forEach(sub => {
      if (sub.startsWith('O:')) {
        const symbol = sub.split(':')[1];
        const mockOptionQuote: PolygonOptionQuote = {
          symbol,
          bid: Math.random() * 10,
          ask: Math.random() * 10 + 0.5,
          last: Math.random() * 10 + 0.25,
          volume: Math.floor(Math.random() * 10000),
          timestamp: Date.now(),
          strike: 175,
          expiration: '2025-01-17',
          type: Math.random() > 0.5 ? 'call' : 'put',
          impliedVolatility: Math.random() * 0.5 + 0.1,
          delta: Math.random() * 0.8 - 0.4,
          gamma: Math.random() * 0.1,
          theta: -Math.random() * 0.1,
          vega: Math.random() * 0.3
        };
        this.notifyCallbacks(`option.${symbol}`, mockOptionQuote);
      }
    });
  }

  private handleWebSocketMessage(message: any) {
    try {
      const data = JSON.parse(message.data);
      
      if (Array.isArray(data)) {
        data.forEach(item => this.processMessage(item));
      } else {
        this.processMessage(data);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private processMessage(item: any) {
    switch (item.ev) {
      case 'Q': // Quote
        this.notifyCallbacks(`quote.${item.sym}`, {
          symbol: item.sym,
          bid: item.b,
          ask: item.a,
          last: item.l || (item.b + item.a) / 2,
          volume: item.v || 0,
          timestamp: item.t
        });
        break;
        
      case 'T': // Trade
        this.notifyCallbacks(`trade.${item.sym}`, {
          symbol: item.sym,
          price: item.p,
          size: item.s,
          timestamp: item.t,
          conditions: item.c
        });
        break;
        
      case 'O': // Options quote
        this.notifyCallbacks(`option.${item.sym}`, {
          symbol: item.sym,
          bid: item.b,
          ask: item.a,
          last: item.l,
          volume: item.v,
          timestamp: item.t,
          strike: item.strike,
          expiration: item.expiration,
          type: item.type,
          impliedVolatility: item.iv,
          delta: item.delta,
          gamma: item.gamma,
          theta: item.theta,
          vega: item.vega
        });
        break;
    }
  }

  private notifyCallbacks(event: string, data: any) {
    const callbacks = this.callbacks.get(event) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in callback:', error);
      }
    });
  }

  // Public API methods
  async connect(): Promise<void> {
    if (this.apiKey === 'demo_key') {
      return Promise.resolve();
    }

    // If we already have a connection promise, return it
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // If already connected, resolve immediately
    if (this.isConnected) {
      return Promise.resolve();
    }

    // Create a new connection promise
    this.connectionPromise = new Promise<void>((resolve, reject) => {
      // Store the resolve and reject functions to be called by event handlers
      this.resolveConnection = resolve;
      this.rejectConnection = reject;

      // Set a timeout for the connection
      const timeout = setTimeout(() => {
        if (this.rejectConnection) {
          this.rejectConnection(new Error('WebSocket connection timeout'));
          this.resolveConnection = null;
          this.rejectConnection = null;
        }
      }, 10000); // 10 second timeout

      // Clear timeout if connection succeeds or fails
      const originalResolve = this.resolveConnection;
      const originalReject = this.rejectConnection;

      this.resolveConnection = () => {
        clearTimeout(timeout);
        if (originalResolve) originalResolve();
      };

      this.rejectConnection = (error: any) => {
        clearTimeout(timeout);
        if (originalReject) originalReject(error);
      };

      // The WebSocket connection is automatically established when the client is created
      // We just need to wait for the onopen event to fire
      if (this.isConnected) {
        // Already connected, resolve immediately
        this.resolveConnection();
      }
    });

    return this.connectionPromise;
  }

  disconnect(): void {
    if (this.wsClient && this.isConnected) {
      if (typeof this.wsClient.disconnect === 'function') {
        this.wsClient.disconnect();
      } else if (typeof this.wsClient.close === 'function') {
        this.wsClient.close();
      }
    }
    this.isConnected = false;
    this.subscriptions.clear();
    this.callbacks.clear();
    this.connectionPromise = null;
    this.resolveConnection = null;
    this.rejectConnection = null;
  }

  // Subscribe to real-time stock quotes
  subscribeToQuotes(symbols: string[], callback: (quote: PolygonQuote) => void): void {
    symbols.forEach(symbol => {
      const subscription = `Q.${symbol}`;
      this.subscriptions.add(subscription);
      
      const eventKey = `quote.${symbol}`;
      if (!this.callbacks.has(eventKey)) {
        this.callbacks.set(eventKey, []);
      }
      this.callbacks.get(eventKey)!.push(callback);

      // Subscribe via WebSocket if connected
      if (this.isConnected && this.wsClient && this.apiKey !== 'demo_key') {
        this.wsClient.send(JSON.stringify({
          action: 'subscribe',
          params: subscription
        }));
      }
    });
  }

  // Subscribe to real-time option quotes
  subscribeToOptionQuotes(symbols: string[], callback: (quote: PolygonOptionQuote) => void): void {
    symbols.forEach(symbol => {
      const subscription = `O:${symbol}`;
      this.subscriptions.add(subscription);
      
      const eventKey = `option.${symbol}`;
      if (!this.callbacks.has(eventKey)) {
        this.callbacks.set(eventKey, []);
      }
      this.callbacks.get(eventKey)!.push(callback);

      // Subscribe via WebSocket if connected
      if (this.isConnected && this.wsClient && this.apiKey !== 'demo_key') {
        this.wsClient.send(JSON.stringify({
          action: 'subscribe',
          params: subscription
        }));
      }
    });
  }

  // Subscribe to trades
  subscribeToTrades(symbols: string[], callback: (trade: PolygonTrade) => void): void {
    symbols.forEach(symbol => {
      const subscription = `T.${symbol}`;
      this.subscriptions.add(subscription);
      
      const eventKey = `trade.${symbol}`;
      if (!this.callbacks.has(eventKey)) {
        this.callbacks.set(eventKey, []);
      }
      this.callbacks.get(eventKey)!.push(callback);

      // Subscribe via WebSocket if connected
      if (this.isConnected && this.wsClient && this.apiKey !== 'demo_key') {
        this.wsClient.send(JSON.stringify({
          action: 'subscribe',
          params: subscription
        }));
      }
    });
  }

  // Unsubscribe from symbol
  unsubscribe(symbol: string, type: 'quote' | 'option' | 'trade' = 'quote'): void {
    const prefix = type === 'quote' ? 'Q.' : type === 'option' ? 'O:' : 'T.';
    const subscription = `${prefix}${symbol}`;
    
    this.subscriptions.delete(subscription);
    this.callbacks.delete(`${type}.${symbol}`);

    if (this.isConnected && this.wsClient && this.apiKey !== 'demo_key') {
      this.wsClient.send(JSON.stringify({
        action: 'unsubscribe',
        params: subscription
      }));
    }
  }

  // REST API methods for historical data
  async getStockQuote(symbol: string): Promise<PolygonQuote | null> {
    if (this.apiKey === 'demo_key') {
      return {
        symbol,
        bid: 175 + Math.random() * 10 - 5,
        ask: 175 + Math.random() * 10 - 4.5,
        last: 175 + Math.random() * 10 - 4.75,
        volume: Math.floor(Math.random() * 1000000),
        timestamp: Date.now()
      };
    }

    try {
      const response = await this.restClient.stocks.lastQuote(symbol);
      return {
        symbol,
        bid: response.results.bid,
        ask: response.results.ask,
        last: response.results.last?.price || (response.results.bid + response.results.ask) / 2,
        volume: response.results.last?.size || 0,
        timestamp: response.results.timeframe
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }

  async getOptionsChain(symbol: string, expiration?: string): Promise<PolygonOptionQuote[]> {
    if (this.apiKey === 'demo_key') {
      // Return mock options chain
      const options: PolygonOptionQuote[] = [];
      const basePrice = 175;
      
      for (let i = -5; i <= 5; i++) {
        const strike = basePrice + i * 5;
        
        // Call option
        options.push({
          symbol: `O:${symbol}${expiration?.replace(/-/g, '')}C${strike.toString().padStart(8, '0')}`,
          bid: Math.random() * 5,
          ask: Math.random() * 5 + 0.5,
          last: Math.random() * 5 + 0.25,
          volume: Math.floor(Math.random() * 1000),
          timestamp: Date.now(),
          strike,
          expiration: expiration || '2025-01-17',
          type: 'call',
          impliedVolatility: Math.random() * 0.5 + 0.1,
          delta: Math.random() * 0.8,
          gamma: Math.random() * 0.1,
          theta: -Math.random() * 0.1,
          vega: Math.random() * 0.3
        });

        // Put option
        options.push({
          symbol: `O:${symbol}${expiration?.replace(/-/g, '')}P${strike.toString().padStart(8, '0')}`,
          bid: Math.random() * 5,
          ask: Math.random() * 5 + 0.5,
          last: Math.random() * 5 + 0.25,
          volume: Math.floor(Math.random() * 1000),
          timestamp: Date.now(),
          strike,
          expiration: expiration || '2025-01-17',
          type: 'put',
          impliedVolatility: Math.random() * 0.5 + 0.1,
          delta: -Math.random() * 0.8,
          gamma: Math.random() * 0.1,
          theta: -Math.random() * 0.1,
          vega: Math.random() * 0.3
        });
      }
      
      return options;
    }

    try {
      const params: any = {
        'underlying_ticker': symbol,
        limit: 1000
      };
      
      if (expiration) {
        params['expiration_date'] = expiration;
      }

      const response = await this.restClient.options.listContracts(params);
      
      return response.results?.map((contract: any) => ({
        symbol: contract.ticker,
        bid: contract.last_quote?.bid || 0,
        ask: contract.last_quote?.ask || 0,
        last: contract.last_trade?.price || 0,
        volume: contract.last_trade?.size || 0,
        timestamp: contract.last_quote?.timeframe || Date.now(),
        strike: contract.strike_price,
        expiration: contract.expiration_date,
        type: contract.contract_type.toLowerCase(),
        impliedVolatility: contract.implied_volatility,
        delta: contract.greeks?.delta,
        gamma: contract.greeks?.gamma,
        theta: contract.greeks?.theta,
        vega: contract.greeks?.vega
      })) || [];
    } catch (error) {
      console.error(`Error fetching options chain for ${symbol}:`, error);
      return [];
    }
  }

  async getHistoricalData(symbol: string, from: string, to: string): Promise<any[]> {
    if (this.apiKey === 'demo_key') {
      // Return mock historical data
      const data = [];
      const start = new Date(from);
      const end = new Date(to);
      let currentPrice = 175;
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const change = (Math.random() - 0.5) * 0.04; // ±2% daily change
        currentPrice *= (1 + change);
        
        data.push({
          timestamp: d.toISOString().split('T')[0],
          open: currentPrice * (1 + (Math.random() - 0.5) * 0.01),
          high: currentPrice * (1 + Math.random() * 0.02),
          low: currentPrice * (1 - Math.random() * 0.02),
          close: currentPrice,
          volume: Math.floor(Math.random() * 50000000 + 10000000)
        });
      }
      
      return data;
    }

    try {
      const response = await this.restClient.stocks.aggregates(symbol, 1, 'day', from, to);
      return response.results?.map((bar: any) => ({
        timestamp: new Date(bar.t).toISOString().split('T')[0],
        open: bar.o,
        high: bar.h,
        low: bar.l,
        close: bar.c,
        volume: bar.v
      })) || [];
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      return [];
    }
  }

  // Connection status
  isConnectedToStream(): boolean {
    return this.isConnected;
  }

  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }
}

// Export singleton instance
export const polygonService = new PolygonService();