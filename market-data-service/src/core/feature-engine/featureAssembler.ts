import { FeatureSnapshot } from "@shared/types/feature-snapshot";
import { OrderBookState } from "./orderbookState";
import { computeSpread } from "./spread";
import { computeOFI } from "./ofi";

export function assembleFeatureSnapshot(args: {
  exchange: string;
  symbol: string;
  ts_event: number;
  ts_recv: number;
  orderbook: OrderBookState;
}): FeatureSnapshot | null {
  const { exchange, symbol, ts_event, ts_recv, orderbook } = args;

  // 1️⃣ spread / mid
  const spreadFeature = computeSpread(orderbook);
  if (!spreadFeature) return null;

  const { mid, spread } = spreadFeature;

  // 2️⃣ OFI
  const ofi1s = computeOFI(orderbook, 1000);
  const ofi5s = computeOFI(orderbook, 5000);

  return {
    exchange,
    symbol,
    ts_event,
    ts_recv,

    mid,
    spread,

    ofi_1s: ofi1s,
    ofi_5s: ofi5s,

    // returns / microprice later
    version: 1,
  };
}
