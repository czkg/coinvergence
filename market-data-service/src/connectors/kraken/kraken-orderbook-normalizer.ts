import { NormalizedOrderBookUpdate } from "@shared/types/unified-market-data";
import { OrderBookMerger } from "../../core/orderbook-merger";
import { normalizeSymbol } from "../../core/symbol-normalizer";

interface KrakenOrderBookState {
  channelToSymbol: Record<number, string>;
  books: Record<string, OrderBookMerger>;
}

const state: KrakenOrderBookState = {
  channelToSymbol: {},
  books: {}
};

/**
 * Normalize Kraken orderbook WS messages (snapshot + diff).
 *
 * Kraken message types:
 * - System/status messages: object (ignored)
 * - Data messages: array
 *   [ channelId, data, channelName, pair ]
 */
export function normalizeKrakenOrderBook(
  msg: any
): NormalizedOrderBookUpdate | null {
  // ------------------------------------------------------------
  // 1. Only array messages with minimum structure
  // ------------------------------------------------------------
  if (!Array.isArray(msg) || msg.length < 4) return null;

  const channelID = msg[0];
  const data = msg[1];
  const channelName = msg[2];
  const rawSymbol = msg[3];

  // ------------------------------------------------------------
  // 2. channelName must be string and book channel
  // ------------------------------------------------------------
  if (typeof channelName !== "string") return null;
  if (!channelName.startsWith("book")) return null;

  // ------------------------------------------------------------
  // 3. data must be object
  // ------------------------------------------------------------
  if (!data || typeof data !== "object") return null;

  const symbol = normalizeSymbol("kraken", rawSymbol);

  // Map channel → symbol (stable after first snapshot)
  if (!state.channelToSymbol[channelID]) {
    state.channelToSymbol[channelID] = symbol;
  }

  // Ensure orderbook exists
  if (!state.books[symbol]) {
    state.books[symbol] = new OrderBookMerger();
  }

  const ob = state.books[symbol];
  const ts_event = Date.now();
  const ts_recv = Date.now();

  // ------------------------------------------------------------
  // SNAPSHOT
  // ------------------------------------------------------------
  if (data.as || data.bs) {
    const asks = (data.as ?? []).map(
      ([p, s]: any) => [Number(p), Number(s)] as [number, number]
    );
    const bids = (data.bs ?? []).map(
      ([p, s]: any) => [Number(p), Number(s)] as [number, number]
    );

    ob.applySnapshot({ bids, asks });
    const l2 = ob.getL2();

    return {
      type: "orderbook",
      exchange: "kraken",
      symbol,
      ts_event,
      ts_recv,
      snapshot: true,
      bids: l2.bids,
      asks: l2.asks
    };
  }

  // ------------------------------------------------------------
  // DIFF
  // ------------------------------------------------------------
  if (data.a || data.b) {
    const askDiffs = (data.a ?? []).map(
      ([p, s]: any) => [Number(p), Number(s)] as [number, number]
    );
    const bidDiffs = (data.b ?? []).map(
      ([p, s]: any) => [Number(p), Number(s)] as [number, number]
    );

    ob.applyDiff({ bids: bidDiffs, asks: askDiffs });
    const l2 = ob.getL2();

    return {
      type: "orderbook",
      exchange: "kraken",
      symbol,
      ts_event,
      ts_recv,
      snapshot: false,
      bids: l2.bids,
      asks: l2.asks
    };
  }

  return null;
}
