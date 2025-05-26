// Black-Scholes Option Pricing Model Implementation
export const blackScholes = {
  // Standard normal cumulative distribution function
  normalCDF(x: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - p : p;
  },

  // Calculate d1 and d2 parameters
  calculateD1D2(S: number, K: number, r: number, sigma: number, T: number): [number, number] {
    const d1 = (Math.log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);
    return [d1, d2];
  },

  // Calculate call option price
  calculateCall(S: number, K: number, r: number, sigma: number, T: number): number {
    const [d1, d2] = this.calculateD1D2(S, K, r, sigma, T);
    return S * this.normalCDF(d1) - K * Math.exp(-r * T) * this.normalCDF(d2);
  },

  // Calculate put option price
  calculatePut(S: number, K: number, r: number, sigma: number, T: number): number {
    const [d1, d2] = this.calculateD1D2(S, K, r, sigma, T);
    return K * Math.exp(-r * T) * this.normalCDF(-d2) - S * this.normalCDF(-d1);
  },

  // Calculate implied volatility using Newton-Raphson method
  calculateImpliedVolatility(
    marketPrice: number,
    S: number,
    K: number,
    r: number,
    T: number,
    isCall: boolean,
    tolerance: number = 0.0001,
    maxIterations: number = 100
  ): number {
    let sigma = 0.5; // Initial guess
    let iteration = 0;

    while (iteration < maxIterations) {
      const price = isCall 
        ? this.calculateCall(S, K, r, sigma, T)
        : this.calculatePut(S, K, r, sigma, T);
      
      const diff = marketPrice - price;
      
      if (Math.abs(diff) < tolerance) {
        return sigma;
      }

      // Calculate vega
      const [d1] = this.calculateD1D2(S, K, r, sigma, T);
      const vega = S * Math.sqrt(T) * Math.exp(-d1 * d1 / 2) / Math.sqrt(2 * Math.PI);
      
      // Update sigma
      sigma = sigma + diff / vega;
      
      // Ensure sigma stays within reasonable bounds
      sigma = Math.max(0.01, Math.min(sigma, 5));
      
      iteration++;
    }

    return sigma;
  },

  // Check for arbitrage opportunities
  findArbitrageOpportunity(
    marketCall: number,
    marketPut: number,
    S: number,
    K: number,
    r: number,
    T: number
  ): { 
    hasArbitrage: boolean;
    putCallParity: number;
    difference: number;
    strategy: string;
  } {
    // Put-Call Parity: C + Ke^(-rT) = P + S
    const theoreticalDifference = marketCall + K * Math.exp(-r * T) - (marketPut + S);
    const threshold = 0.05; // 5 cents threshold for arbitrage

    return {
      hasArbitrage: Math.abs(theoreticalDifference) > threshold,
      putCallParity: K * Math.exp(-r * T),
      difference: theoreticalDifference,
      strategy: theoreticalDifference > threshold 
        ? "Sell Call, Buy Put, Buy Stock, Borrow PV(K)"
        : theoreticalDifference < -threshold
          ? "Buy Call, Sell Put, Sell Stock, Lend PV(K)"
          : "No arbitrage opportunity"
    };
  }
};