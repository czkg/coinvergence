/**
 * Unified Market Data Protocol
 * ----------------------------
 * This file defines the canonical event types for all market data emitted
 * by market-data-service and consumed by:
 *
 * - feature-engine
 * - ai-model-service
 * - execution-router
 * - backend-api (for UI quotes)
 *
 * No service should define its own market data schema.
 * This is the single source of truth.
 */

export type Exchange =
  | "binance"
  | "coinbase"
  | "kraken"
  | "bitstamp"
  | "okx"
  | "bybit"
  | "bitmex"
  | "deribit"; // extensible—add more as needed

/**
 * UnifiedMarketData
 * -----------------
 * Top-level union of all possible market events.
 * Every market data emission must conform to one of these interfaces.
 */
export type UnifiedMarketData =
  | NormalizedOrderBookUpdate
  | NormalizedTrade
  | NormalizedQuote;

/**
 * Order Book Update (snapshot or incremental diff)
 * ------------------------------------------------
 * This is the MOST IMPORTANT event type in the entire system.
 *
 * All exchanges must normalize their order book updates to this format.
 * Both snapshot and incremental updates use the same schema.
 *
 * bids/asks are arrays of [price, size].
 * size = 0 indicates deletion of a level.
 */
export interface NormalizedOrderBookUpdate {
  type: "orderbook";

  /** Exchange origin */
  exchange: Exchange;

  /** Normalized symbol format, e.g., "BTC-USD" */
  symbol: string;

  /** Timestamp from exchange (ms). If unavailable, set to -1. */
  ts_event: number;

  /** Timestamp when our system received the event (ms). */
  ts_recv: number;

  /**
   * Whether this update is a full depth snapshot.
   * true  = snapshot
   * false = incremental diff
   */
  snapshot: boolean;

  /**
   * List of bid updates. Each entry is [price, size].
   * size = 0 → remove that price level.
   */
  bids: [number, number][];

  /** List of ask updates. Same rules as bids. */
  asks: [number, number][];
}

/**
 * Trade (match) event
 * -------------------
 * Represents an executed trade at the exchange.
 *
 * side refers to the TAKER SIDE.
 *   buy  = taker bought from the ask → bullish pressure
 *   sell = taker sold into the bid  → bearish pressure
 */
export interface NormalizedTrade {
  type: "trade";

  exchange: Exchange;
  symbol: string;
  ts_event: number;
  ts_recv: number;

  /** Trade execution price */
  price: number;

  /** Trade size (base asset quantity) */
  size: number;

  /** Taker side: buy (aggressive bid) or sell (aggressive ask) */
  side: "buy" | "sell";
}

/**
 * Quote (top of book)
 * --------------------
 * Lightweight event containing only the best bid/ask.
 * Used by frontend UI, basic routing, and some simple features.
 */
export interface NormalizedQuote {
  type: "quote";

  exchange: Exchange;
  symbol: string;
  ts_event: number;
  ts_recv: number;

  /** Best bid price and size */
  bid: number;
  bidSize: number;

  /** Best ask price and size */
  ask: number;
  askSize: number;
}
