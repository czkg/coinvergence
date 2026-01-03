import { NormalizedOrderBookUpdate } from "@shared/types/unified-market-data";
import { OrderBookMerger } from "../../core/orderbook-merger";
import { normalizeSymbol } from "../../core/symbol-normalizer";

/**
 * Per-symbol in-memory orderbook state.
 *
 * OKX sends:
 * - full snapshots
 * - incremental diffs
 * - mixed with other channels in the same WS
 */
const books: Record<string, OrderBookMerger> = {};

export function normalizeOKXOrderBook(
  msg: any
): NormalizedOrderBookUpdate | null {
  // ------------------------------------------------------------
  // 1. Only handle orderbook ("books") channel
  // ------------------------------------------------------------
  if (!msg?.arg || msg.arg.channel !== "books") {
    return null;
  }

  // ------------------------------------------------------------
  // 2. Must have data array
  // ------------------------------------------------------------
  if (!Array.isArray(msg.data) || msg.data.length === 0) {
    return null;
  }

  const entry = msg.data[0];
  const { bids, asks, ts } = entry;

  // ------------------------------------------------------------
  // 3. bids / asks must exist
  // ------------------------------------------------------------
  if (!Array.isArray(bids) || !Array.isArray(asks)) {
    return null;
  }

  // ------------------------------------------------------------
  // 4. Normalize symbol
  // ------------------------------------------------------------
  const symbol = normalizeSymbol("okx", msg.arg.instId);

  // ------------------------------------------------------------
  // 5. Get or create orderbook state
  // ------------------------------------------------------------
  if (!books[symbol]) {
    books[symbol] = new OrderBookMerger();
  }
  const ob = books[symbol];

  // ------------------------------------------------------------
  // 6. Convert price levels
  // OKX format: [price, size, _, _]
  // ------------------------------------------------------------
  const bidDiffs: [number, number][] = bids.map(
    ([p, s]: any) => [Number(p), Number(s)]
  );
  const askDiffs: [number, number][] = asks.map(
    ([p, s]: any) => [Number(p), Number(s)]
  );

  // ------------------------------------------------------------
  // 7. Snapshot vs diff
  // OKX sends both through the same channel
  // ------------------------------------------------------------
  const isSnapshot = bidDiffs.length > 0 && askDiffs.length > 0;

  if (isSnapshot) {
    ob.applySnapshot({ bids: bidDiffs, asks: askDiffs });
  } else {
    ob.applyDiff({ bids: bidDiffs, asks: askDiffs });
  }

  // ------------------------------------------------------------
  // 8. Emit unified L2 view
  // ------------------------------------------------------------
  const l2 = ob.getL2();

  return {
    type: "orderbook",
    exchange: "okx",
    symbol,
    snapshot: isSnapshot,
    bids: l2.bids,
    asks: l2.asks,
    ts_event: Number(ts),
    ts_recv: Date.now(),
  };
}
