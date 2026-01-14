import { Feature } from "../feature";
import { MarketState } from "../../engine/market-state";

/**
 * Order Flow Imbalance (OFI)
 *
 * Top-of-book based OFI over a rolling event-time window.
 * Replay-safe: uses state.lastEventTs (event-time), never Date.now().
 */
type TopOfBook = {
  ts: number;
  bidPrice: number;
  bidSize: number;
  askPrice: number;
  askSize: number;
};

export class OFIFeature implements Feature<number> {
  readonly name: string;

  private readonly windowMs: number;
  private history: TopOfBook[] = [];

  constructor(windowMs: number, name?: string) {
    this.windowMs = windowMs;
    // allow distinguishing multiple windows: ofi_1s / ofi_5s, etc.
    this.name = name ?? `ofi_${Math.floor(windowMs / 1000)}s`;
  }

  value(state: MarketState): number {
    const ob = state.orderBook;

    // Even if isReady() is true, keep the getters safe for strict typing.
    if (!ob.isReady()) return 0;

    const bid = ob.getBestBid();
    const ask = ob.getBestAsk();
    if (!bid || !ask) return 0;

    // Guard invalid prices (crossed/zero)
    if (bid.price <= 0 || ask.price <= 0) return 0;
    if (ask.price < bid.price) return 0;

    const ts = state.lastEventTs;
    if (!ts || ts <= 0) return 0;

    // Append current top-of-book
    this.history.push({
      ts,
      bidPrice: bid.price,
      bidSize: bid.size,
      askPrice: ask.price,
      askSize: ask.size,
    });

    // Evict old entries by event-time
    const cutoff = ts - this.windowMs;
    while (this.history.length > 0) {
      const first = this.history[0];
      if (!first || first.ts >= cutoff) break;
      this.history.shift();
    }

    if (this.history.length < 2) return 0;

    // Compute OFI (handle noUncheckedIndexedAccess safely)
    let ofi = 0;

    for (let i = 1; i < this.history.length; i++) {
      const prev = this.history[i - 1];
      const curr = this.history[i];
      if (!prev || !curr) continue;

      // Bid side contribution
      if (curr.bidPrice === prev.bidPrice) {
        ofi += curr.bidSize - prev.bidSize;
      } else if (curr.bidPrice > prev.bidPrice) {
        ofi += curr.bidSize;
      } else {
        ofi -= prev.bidSize;
      }

      // Ask side contribution (opposite sign)
      if (curr.askPrice === prev.askPrice) {
        ofi -= curr.askSize - prev.askSize;
      } else if (curr.askPrice < prev.askPrice) {
        ofi -= curr.askSize;
      } else {
        ofi += prev.askSize;
      }
    }

    return ofi;
  }
}
