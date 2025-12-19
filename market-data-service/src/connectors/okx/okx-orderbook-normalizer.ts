import { NormalizedOrderBookUpdate } from "../../../../shared/types/unified-market-data";
import { OrderBookMerger } from "../../core/orderbook-merger";
import { normalizeSymbol } from "../../core/symbol-normalizer";

const books: Record<string, OrderBookMerger> = {};

export function normalizeOKXOrderBook(msg: any): NormalizedOrderBookUpdate | null {
  if (!msg?.data?.[0]) return null;

  const { bids, asks, ts } = msg.data[0];
  const symbol = normalizeSymbol("okx", msg.arg.instId);

  if (!books[symbol]) books[symbol] = new OrderBookMerger();
  const ob = books[symbol];

  const bidDiffs = bids.map(
    ([p, s]: any) => [Number(p), Number(s)] as [number, number]
  );
  const askDiffs = asks.map(
    ([p, s]: any) => [Number(p), Number(s)] as [number, number]
  );

  const isSnapshot = bidDiffs.length > 0 && askDiffs.length > 0;

  if (isSnapshot) {
    ob.applySnapshot({ bids: bidDiffs, asks: askDiffs });
  } else {
    ob.applyDiff({ bids: bidDiffs, asks: askDiffs });
  }

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
