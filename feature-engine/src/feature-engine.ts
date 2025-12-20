import {
  NormalizedOrderBookUpdate,
  NormalizedTrade,
} from "../../shared/types/unified-market-data";
import { FeatureSnapshot } from "../../shared/types/feature";
import { RollingWindow } from "./rolling-window";

export class FeatureEngine {
  private lastMid: number | null = null;

  // rolling windows
  private returns1s = new RollingWindow(1000);
  private returns5s = new RollingWindow(5000);

  private ofi1s = new RollingWindow(1000);
  private ofi5s = new RollingWindow(5000);

  onTrade(trade: NormalizedTrade) {
    const signedSize =
      trade.side === "buy" ? trade.size : -trade.size;

    const ts = trade.ts_event;
    this.ofi1s.add(ts, signedSize);
    this.ofi5s.add(ts, signedSize);
  }

  onOrderBook(
    ob: NormalizedOrderBookUpdate
  ): FeatureSnapshot | null {
    const bestBid = ob.bids[0];
    const bestAsk = ob.asks[0];
    if (!bestBid || !bestAsk) return null;

    const bidPrice = bestBid[0];
    const bidSize = bestBid[1];
    const askPrice = bestAsk[0];
    const askSize = bestAsk[1];

    const mid = (bidPrice + askPrice) / 2;
    const spread = Math.max(0, askPrice - bidPrice);

    const ts = ob.ts_event;

    // -----------------------------
    // returns
    // -----------------------------
    if (this.lastMid !== null) {
      const r = (mid - this.lastMid) / this.lastMid;
      this.returns1s.add(ts, r);
      this.returns5s.add(ts, r);
    }

    const returns_1s = this.returns1s.sum(ts);
    const returns_5s = this.returns5s.sum(ts);

    // -----------------------------
    // OFI
    // -----------------------------
    const ofi_1s = this.ofi1s.sum(ts);
    const ofi_5s = this.ofi5s.sum(ts);

    // -----------------------------
    // microprice
    // -----------------------------
    const microprice =
      (bidPrice * askSize + askPrice * bidSize) /
      (bidSize + askSize);

    this.lastMid = mid;

    return {
      symbol: ob.symbol,
      ts_event: ob.ts_event,
      ts_recv: ob.ts_recv,
      mid,
      spread,
      returns_1s,
      returns_5s,
      ofi_1s,
      ofi_5s,
      microprice,
    };
  }
}
