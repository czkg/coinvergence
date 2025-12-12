import {
  NormalizedOrderBookUpdate,
  UnifiedMarketData
} from "../../../../shared/types/unified-market-data";
import { OrderBookMerger } from "../../core/orderbook-merger";

const orderbooks: Record<string, OrderBookMerger> = {};

export function normalizeCoinbaseUpdate(raw: any): UnifiedMarketData[] | null {
  if (!raw || !raw.type || !raw.product_id) return null;

  const symbol = raw.product_id;

  // Ensure merger exists
  if (!orderbooks[symbol]) {
    orderbooks[symbol] = new OrderBookMerger();
  }

  const merger = orderbooks[symbol];

  const ts_event = raw.time ? new Date(raw.time).getTime() : Date.now();
  const ts_recv = Date.now();

  /** ------------------------------
   * SNAPSHOT
   * ------------------------------*/
  if (raw.type === "snapshot") {
    const bids = raw.bids.map(([p, s]: any) => [Number(p), Number(s)]);
    const asks = raw.asks.map(([p, s]: any) => [Number(p), Number(s)]);

    merger.applySnapshot({ bids, asks });

    const l2 = merger.getL2();

    return [
      {
        type: "orderbook",
        exchange: "coinbase",
        symbol,
        ts_event,
        ts_recv,
        snapshot: true,
        bids: l2.bids,
        asks: l2.asks,
      } satisfies NormalizedOrderBookUpdate,
    ];
  }

  /** ------------------------------
   * INCREMENTAL L2 UPDATE
   * ------------------------------*/
  if (raw.type === "l2update") {
    const bidDiffs: [number, number][] = [];
    const askDiffs: [number, number][] = [];

    for (const [side, price, size] of raw.changes) {
      const p = Number(price);
      const s = Number(size);

      if (side === "buy") bidDiffs.push([p, s]);
      else askDiffs.push([p, s]);
    }

    merger.applyDiff({
      bids: bidDiffs,
      asks: askDiffs,
    });

    const l2 = merger.getL2();

    return [
      {
        type: "orderbook",
        exchange: "coinbase",
        symbol,
        ts_event,
        ts_recv,
        snapshot: false,
        bids: l2.bids,
        asks: l2.asks,
      } satisfies NormalizedOrderBookUpdate,
    ];
  }

  return null;
}
