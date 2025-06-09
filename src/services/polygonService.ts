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
  private wsClient: any = null;
  private apiKey: string;
  private isConnected: boolean = false;
  private subscriptions: Set<string> = new Set();
  private callbacks: Map<string, Function[]> = new Map();
  private connectionPromise: Promise<void> | null = null;
  private resolveConnection: (() => void) | null = null;
  private rejectConnection: ((error: any) => void) | null = null;
  private isMarketHours: boolean = false;
  private marketHoursCheckInterval: NodeJS.Timeout | null = null;
  private isMockMode: boolean = false;

  constructor() {
    // In production, this should come from environment variables
    this.apiKey = import.meta.env.VITE_POLYGON_API_KEY || 'demo_key';
    
    if (this.apiKey === 'demo_key') {
      console.warn('Using demo Polygon.io key. Real-time data will be simulated.');
      this.isMockMode = true;
      this.initializeMockService();
    } else {
      this.checkMarketHours();
      this.initializePolygonClients();
    }

    // Check market hours every 5 minutes
    this.marketHoursCheckInterval = setInterval(() => {
      this.checkMarketHours();
    }, 5 * 60 * 1000);
  }

  private checkMarketHours(): void {
    const now = new Date();
    const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    const day = easternTime.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = easternTime.getHours();
    const minute = easternTime.getMinutes();
    const timeInMinutes = hour * 60 + minute;

    // Market hours: Monday-Friday 9:30 AM - 4:00 PM ET
    // Pre-market: 4:00 AM - 9:30 AM ET
    // After-hours: 4:00 PM - 8:00 PM ET
    const isWeekday = day >= 1 && day <= 5;
    const marketOpen = 9 * 60 + 30; // 9:30 AM
    const marketClose = 16 * 60; // 4:00 PM
    const preMarketStart = 4 * 60; // 4:00 AM
    const afterHoursEnd = 20 * 60; // 8:00 PM

    const wasMarketHours = this.isMarketHours;
    this.isMarketHours = isWeekday && timeInMinutes >= marketOpen && timeInMinutes < marketClose;
    
    const isExtendedHours = isWeekday && (
      (timeInMinutes >= preMarketStart && timeInMinutes < marketOpen) ||
      (timeInMinutes >= marketClose && timeInMinutes < afterHoursEnd)
    );

    console.log(`Market status check: ${this.isMarketHours ? 'Regular hours' : isExtendedHours ? 'Extended hours' : 'Market closed'}`);

    // If market just opened, try to reconnect (only if not in mock mode)
    if (!wasMarketHours && this.isMarketHours && !this.isMockMode) {
      console.log('Market opened - attempting to establish WebSocket connection');
      this.initializePolygonClients();
    }
  }

  private initializePolygonClients() {
    try {
      this.restClient = restClient(this.apiKey);
      
      // Only initialize WebSocket during market hours or extended hours and not in mock mode
      if (this.shouldUseWebSocket() && !this.isMockMode) {
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
          
          // Only attempt to reconnect during market hours and not in mock mode
          if (this.shouldUseWebSocket() && !this.isMockMode) {
            setTimeout(() => this.connect(), 5000);
          }
        };

        this.wsClient.onerror = (error: any) => {
          console.error('Polygon WebSocket error:', error);
          
          // Switch to mock mode on WebSocket error
          console.warn('WebSocket error encountered, switching to mock mode');
          this.isMockMode = true;
          this.initializeMockService();
          
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
      } else {
        console.log('Market closed or mock mode - using REST API and simulated data');
        this.wsClient = null; // Explicitly set to null
        if (this.isMockMode) {
          this.initializeMockService();
        }
      }

    } catch (error) {
      console.error('Failed to initialize Polygon clients:', error);
      console.warn('Switching to mock mode due to client initialization failure');
      this.isMockMode = true;
      this.wsClient = null; // Explicitly set to null on error
      this.initializeMockService();
    }
  }

  private shouldUseWebSocket(): boolean {
    const now = new Date();
    const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    const day = easternTime.getDay();
    const hour = easternTime.getHours();
    const minute = easternTime.getMinutes();
    const timeInMinutes = hour * 60 + minute;

    // Allow WebSocket during weekdays from 4 AM to 8 PM ET
    const isWeekday = day >= 1 && day <= 5;
    const extendedStart = 4 * 60; // 4:00 AM
    const extendedEnd = 20 * 60; // 8:00 PM

    return isWeekday && timeInMinutes >= extendedStart && timeInMinutes < extendedEnd;
  }

  private initializeMockService() {
    console.log('Initializing mock Polygon service');
    this.wsClient = null; // Explicitly set to null when using mock service
    this.isConnected = true;
    
    // Simulate real-time updates every 2-5 seconds when market is closed
    const updateInterval = this.isMarketHours ? 1000 : 3000;
    setInterval(() => {
      this.simulateMarketData();
    }, updateInterval + Math.random() * 2000);
  }

  private simulateMarketData() {
    // Simulate stock quotes
    const stocks = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN'];
    stocks.forEach(symbol => {
      if (this.subscriptions.has(`Q.${symbol}`)) {
        // Use more realistic price movements during market hours
        const volatility = this.isMarketHours ? 0.002 : 0.0005; // Lower volatility when market is closed
        const basePrice = 175;
        const priceChange = (Math.random() - 0.5) * volatility * basePrice;
        
        const mockQuote: PolygonQuote = {
          symbol,
          bid: basePrice + priceChange - 0.05,
          ask: basePrice + priceChange + 0.05,
          last: basePrice + priceChange,
          volume: Math.floor(Math.random() * (this.isMarketHours ? 1000000 : 100000)),
          timestamp: Date.now()
        };
        this.notifyCallbacks(`quote.${symbol}`, mockQuote);
      }
    });

    // Simulate option quotes with market-appropriate activity
    this.subscriptions.forEach(sub => {
      if (sub.startsWith('O:')) {
        const symbol = sub.split(':')[1];
        const basePrice = Math.random() * 10;
        const spread = this.isMarketHours ? 0.05 : 0.10; // Wider spreads when market is closed
        
        const mockOptionQuote: PolygonOptionQuote = {
          symbol,
          bid: basePrice - spread,
          ask: basePrice + spread,
          last: basePrice,
          volume: Math.floor(Math.random() * (this.isMarketHours ? 10000 : 1000)),
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
    if (this.isMockMode || !this.shouldUseWebSocket()) {
      console.log('Using mock service - no WebSocket connection needed');
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

      // Set a shorter timeout during market hours, longer when market is closed
      const timeoutDuration = this.isMarketHours ? 5000 : 15000;
      const timeout = setTimeout(() => {
        if (this.rejectConnection) {
          const message = this.isMarketHours 
            ? 'WebSocket connection timeout during market hours'
            : 'WebSocket connection timeout - market may be closed, falling back to simulated data';
          
          console.warn(message);
          this.rejectConnection(new Error(message));
          this.resolveConnection = null;
          this.rejectConnection = null;
          
          // Fall back to mock service if connection fails
          this.isMockMode = true;
          this.initializeMockService();
        }
      }, timeoutDuration);

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
    
    // Explicitly set wsClient to null
    this.wsClient = null;
    
    if (this.marketHoursCheckInterval) {
      clearInterval(this.marketHoursCheckInterval);
      this.marketHoursCheckInterval = null;
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

      // Subscribe via WebSocket if connected and wsClient is valid and not in mock mode
      if (this.isConnected && this.wsClient && !this.isMockMode && typeof this.wsClient.send === 'function') {
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

      // Subscribe via WebSocket if connected and wsClient is valid and not in mock mode
      if (this.isConnected && this.wsClient && !this.isMockMode && typeof this.wsClient.send === 'function') {
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

      // Subscribe via WebSocket if connected and wsClient is valid and not in mock mode
      if (this.isConnected && this.wsClient && !this.isMockMode && typeof this.wsClient.send === 'function') {
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

    if (this.isConnected && this.wsClient && !this.isMockMode && typeof this.wsClient.send === 'function') {
      this.wsClient.send(JSON.stringify({
        action: 'unsubscribe',
        params: subscription
      }));
    }
  }

  // REST API methods for historical data
  async getStockQuote(symbol: string): Promise<PolygonQuote | null> {
    if (this.isMockMode) {
      const basePrice = 175;
      const volatility = this.isMarketHours ? 0.002 : 0.0005;
      const priceChange = (Math.random() - 0.5) * volatility * basePrice;
      
      return {
        symbol,
        bid: basePrice + priceChange - 0.05,
        ask: basePrice + priceChange + 0.05,
        last: basePrice + priceChange,
        volume: Math.floor(Math.random() * (this.isMarketHours ? 1000000 : 100000)),
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
      console.warn('Switching to mock mode due to API error');
      this.isMockMode = true;
      this.initializeMockService();
      
      // Recursively call with mock mode enabled
      return this.getStockQuote(symbol);
    }
  }

  async getOptionsChain(symbol: string, expiration?: string): Promise<PolygonOptionQuote[]> {
    if (this.isMockMode) {
      // Return mock options chain
      const options: PolygonOptionQuote[] = [];
      const basePrice = 175;
      
      for (let i = -5; i <= 5; i++) {
        const strike = basePrice + i * 5;
        const spread = this.isMarketHours ? 0.05 : 0.10;
        
        // Call option
        const callPrice = Math.random() * 5;
        options.push({
          symbol: `O:${symbol}${expiration?.replace(/-/g, '')}C${strike.toString().padStart(8, '0')}`,
          bid: callPrice - spread,
          ask: callPrice + spread,
          last: callPrice,
          volume: Math.floor(Math.random() * (this.isMarketHours ? 1000 : 100)),
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
        const putPrice = Math.random() * 5;
        options.push({
          symbol: `O:${symbol}${expiration?.replace(/-/g, '')}P${strike.toString().padStart(8, '0')}`,
          bid: putPrice - spread,
          ask: putPrice + spread,
          last: putPrice,
          volume: Math.floor(Math.random() * (this.isMarketHours ? 1000 : 100)),
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
      // Check if the options method exists
      if (!this.restClient.options || typeof this.restClient.options.listContracts !== 'function') {
        throw new Error('Options API not available or method does not exist');
      }

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
      console.warn('Switching to mock mode due to options API error');
      this.isMockMode = true;
      this.initializeMockService();
      
      // Recursively call with mock mode enabled
      return this.getOptionsChain(symbol, expiration);
    }
  }

  async getHistoricalData(symbol: string, from: string, to: string): Promise<any[]> {
    if (this.isMockMode) {
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
      console.warn('Switching to mock mode due to historical data API error');
      this.isMockMode = true;
      this.initializeMockService();
      
      // Recursively call with mock mode enabled
      return this.getHistoricalData(symbol, from, to);
    }
  }

  // Connection status
  isConnectedToStream(): boolean {
    return this.isConnected;
  }

  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  // Market status
  getMarketStatus(): { isMarketHours: boolean; isExtendedHours: boolean; status: string } {
    const now = new Date();
    const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    const day = easternTime.getDay();
    const hour = easternTime.getHours();
    const minute = easternTime.getMinutes();
    const timeInMinutes = hour * 60 + minute;

    const isWeekday = day >= 1 && day <= 5;
    const marketOpen = 9 * 60 + 30; // 9:30 AM
    const marketClose = 16 * 60; // 4:00 PM
    const preMarketStart = 4 * 60; // 4:00 AM
    const afterHoursEnd = 20 * 60; // 8:00 PM

    const isMarketHours = isWeekday && timeInMinutes >= marketOpen && timeInMinutes < marketClose;
    const isExtendedHours = isWeekday && (
      (timeInMinutes >= preMarketStart && timeInMinutes < marketOpen) ||
      (timeInMinutes >= marketClose && timeInMinutes < afterHoursEnd)
    );

    let status = 'Market Closed';
    if (isMarketHours) status = 'Market Open';
    else if (isExtendedHours) status = 'Extended Hours';

    return { isMarketHours, isExtendedHours, status };
  }

  // Check if service is in mock mode
  isMockModeEnabled(): boolean {
    return this.isMockMode;
  }
}

// Export singleton instance
export const polygonService = new PolygonService();