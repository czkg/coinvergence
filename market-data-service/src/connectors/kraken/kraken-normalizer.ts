import { NormalizedOrderBookUpdate } from "../../../../shared/types/unified-market-data";
import { OrderBookMerger } from "../../core/orderbook-merger";
import { normalizeSymbol } from "../../core/symbol-normalizer";

interface KrakenState {
  channelToSymbol: Record<number, string>;
  books: Record<string, OrderBookMerger>;
}

export const krakenState: KrakenState = {
  channelToSymbol: {},
  books: {}
};

/**
 * Normalize Kraken WS messages into UnifiedMarketData.
 * Kraken sends snapshot + incremental diffs in array format.
 */
export function normalizeKrakenMessage(msg: any): NormalizedOrderBookUpdate | null {
  if (!Array.isArray(msg) || msg.length < 4) return null;

  const channelID = msg[0];
  const data = msg[1];
  const _channelName = msg[2];
  const rawSymbol = msg[3];           // e.g. "XBT/USD"
  const symbol = normalizeSymbol("kraken", rawSymbol);

  // Map channel → symbol if not mapped yet
  if (!krakenState.channelToSymbol[channelID]) {
    krakenState.channelToSymbol[channelID] = symbol;
  }

  // Ensure orderbook exists
  if (!krakenState.books[symbol]) {
    krakenState.books[symbol] = new OrderBookMerger();
  }

  const ob = krakenState.books[symbol];
  const ts_event = Date.now(); // Kraken's timestamps are inside entries; we use recv
  const ts_recv = Date.now();

  /** ------------------------------
   * SNAPSHOT
   * ------------------------------ */
  if (data.as || data.bs) {
    const asks = (data.as ?? []).map(([p, s]: any) => [parseFloat(p), parseFloat(s)]);
    const bids = (data.bs ?? []).map(([p, s]: any) => [parseFloat(p), parseFloat(s)]);

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

  /** ------------------------------
   * DIFF
   * ------------------------------ */
  if (data.a || data.b) {
    const askDiffs = (data.a ?? []).map(([p, s]: any) => [parseFloat(p), parseFloat(s)]);
    const bidDiffs = (data.b ?? []).map(([p, s]: any) => [parseFloat(p), parseFloat(s)]);

    ob.applyDiff({
      bids: bidDiffs,
      asks: askDiffs
    });

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
