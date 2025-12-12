import { NormalizedOrderBookUpdate } from "../../../../shared/types/unified-market-data";

export function normalizeBinanceDepth(raw: any, symbol: string): NormalizedOrderBookUpdate | null {
  // Binance sends incremental diffs only.
  return {
    type: "orderbook",
    exchange: "binance",
    symbol: symbol,
    ts_event: raw.E || Date.now(),
    ts_recv: Date.now(),
    snapshot: false,
    bids: raw.b?.map(([p, s]: any) => [Number(p), Number(s)]) ?? [],
    asks: raw.a?.map(([p, s]: any) => [Number(p), Number(s)]) ?? [],
  };
}
