/**
 * Kalshi API Service
 * Handles all interactions with Kalshi prediction markets
 */

import { kalshiGet, kalshiPost, KalshiAuthConfig } from './kalshi-auth';

const KALSHI_BASE_URL = 'https://api.elections.kalshi.com/trade-api/v2';
const KALSHI_DEMO_URL = 'https://demo-api.kalshi.co/trade-api/v2';

/**
 * Market data returned from Kalshi API
 */
export interface KalshiMarket {
  ticker: string;
  title: string;
  subtitle?: string;
  description?: string;
  event_ticker: string;
  category?: string;
  status: string;
  yes_bid: number;
  yes_ask: number;
  yes_bid_dollars: number;
  yes_ask_dollars: number;
  no_bid: number;
  no_ask: number;
  no_bid_dollars: number;
  no_ask_dollars: number;
  volume_fp: number;
  liquidity: number;
  created_at: string;
  expiration_time: string;
  close_time?: string;
  next_poll_time?: string;
  settlement_source?: string;
  can_close_early: boolean;
}

export interface KalshiMarketsResponse {
  markets: KalshiMarket[];
  cursor?: string;
}

/**
 * Order data for placing a bet
 */
export interface KalshiOrder {
  ticker: string;
  side: 'yes' | 'no';
  action: 'buy' | 'sell';
  count: number;
  type: 'limit' | 'market';
  yes_price?: number;
  no_price?: number;
  client_order_id: string;
  expiration_time?: string;
}

export interface KalshiOrderResponse {
  order: {
    order_id: string;
    ticker: string;
    side: 'yes' | 'no';
    action: 'buy' | 'sell';
    count: number;
    status: string;
    yes_price?: number;
    no_price?: number;
    client_order_id: string;
    created_at: string;
  };
}

/**
 * Portfolio balance
 */
export interface KalshiBalance {
  balance: number;
  earning_balance: number;
  user_id: string;
}

/**
 * Kalshi API service
 */
export class KalshiService {
  private config: KalshiAuthConfig;
  private baseUrl: string;

  constructor(apiKeyId: string, privateKey: string, isDemoMode = false) {
    this.config = {
      apiKeyId,
      privateKey,
      baseUrl: isDemoMode ? KALSHI_DEMO_URL : KALSHI_BASE_URL,
    };
    this.baseUrl = this.config.baseUrl || KALSHI_BASE_URL;
  }

  /**
   * Get all open markets, optionally filtered by category
   */
  async getOpenMarkets(category?: string, limit = 50): Promise<KalshiMarket[]> {
    try {
      const path = `/markets?status=open&limit=${limit}${
        category ? `&category=${category}` : ''
      }`;
      const response = await kalshiGet<KalshiMarketsResponse>(this.config, path);
      return response.markets || [];
    } catch (error) {
      console.error('Failed to fetch Kalshi markets:', error);
      throw error;
    }
  }

  /**
   * Get markets by category
   */
  async getMarketsByCategory(category: string): Promise<KalshiMarket[]> {
    try {
      const path = `/markets?category=${category}&status=open&limit=50`;
      const response = await kalshiGet<KalshiMarketsResponse>(this.config, path);
      return response.markets || [];
    } catch (error) {
      console.error(`Failed to fetch ${category} markets:`, error);
      throw error;
    }
  }

  /**
   * Search markets by ticker or title
   */
  async searchMarkets(query: string): Promise<KalshiMarket[]> {
    try {
      // Kalshi doesn't have a search endpoint, so we fetch and filter
      const markets = await this.getOpenMarkets(undefined, 100);
      const lowerQuery = query.toLowerCase();
      return markets.filter(
        (m) =>
          m.ticker.toLowerCase().includes(lowerQuery) ||
          m.title.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error('Failed to search Kalshi markets:', error);
      throw error;
    }
  }

  /**
   * Get a specific market by ticker
   */
  async getMarket(ticker: string): Promise<KalshiMarket | null> {
    try {
      const path = `/markets/${ticker}`;
      const response = await kalshiGet<{ market: KalshiMarket }>(
        this.config,
        path
      );
      return response.market || null;
    } catch (error) {
      console.error(`Failed to fetch market ${ticker}:`, error);
      return null;
    }
  }

  /**
   * Place a bet (buy/sell contract)
   */
  async placeBet(order: KalshiOrder): Promise<KalshiOrderResponse> {
    try {
      const path = '/portfolio/orders';
      return await kalshiPost<KalshiOrderResponse>(this.config, path, order);
    } catch (error) {
      console.error('Failed to place bet:', error);
      throw error;
    }
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<KalshiBalance | null> {
    try {
      const path = '/portfolio/balance';
      const response = await kalshiGet<KalshiBalance>(this.config, path);
      return response || null;
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      return null;
    }
  }

  /**
   * Get user's open orders
   */
  async getOpenOrders(limit = 50): Promise<any[]> {
    try {
      const path = `/portfolio/orders?limit=${limit}&status=open`;
      const response = await kalshiGet<{ orders: any[] }>(this.config, path);
      return response.orders || [];
    } catch (error) {
      console.error('Failed to fetch open orders:', error);
      throw error;
    }
  }

  /**
   * Get user's positions
   */
  async getPositions(): Promise<any[]> {
    try {
      const path = '/portfolio/positions';
      const response = await kalshiGet<{ positions: any[] }>(this.config, path);
      return response.positions || [];
    } catch (error) {
      console.error('Failed to fetch positions:', error);
      throw error;
    }
  }

  /**
   * Get public markets without authentication
   * Useful for displaying available markets to unauthenticated users
   */
  static async getPublicMarkets(limit = 50, category?: string): Promise<KalshiMarket[]> {
    try {
      const params = `?status=open&limit=${limit}${
        category ? `&category=${category}` : ''
      }`;
      const response = await fetch(
        `${KALSHI_BASE_URL}/markets${params}`
      );

      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }

      const data = (await response.json()) as KalshiMarketsResponse;
      return data.markets || [];
    } catch (error) {
      console.error('Failed to fetch public markets:', error);
      throw error;
    }
  }

  /**
   * Get market orderbook (public, no auth needed)
   */
  static async getMarketOrderbook(ticker: string): Promise<any> {
    try {
      const response = await fetch(
        `${KALSHI_BASE_URL}/markets/${ticker}/orderbook`
      );

      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to fetch orderbook:', error);
      throw error;
    }
  }
}
