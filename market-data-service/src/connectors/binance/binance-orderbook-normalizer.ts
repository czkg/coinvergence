import { NormalizedOrderBookUpdate } from "@shared/types/unified-market-data";

/**
 * Normalize Binance depth diff (bids/asks).
 * Binance sends incremental diffs only (no snapshot).
 */
export function normalizeBinanceOrderBook(
  raw: any,
  symbol: string
): NormalizedOrderBookUpdate | null {
  if (!raw?.b && !raw?.a) return null;

  return {
    type: "orderbook",
    exchange: "binance",
    symbol,
    ts_event: raw.E ?? Date.now(),
    ts_recv: Date.now(),
    snapshot: false,
    bids:
      raw.b?.map(
        ([p, s]: any) => [Number(p), Number(s)] as [number, number]
      ) ?? [],
    asks:
      raw.a?.map(
        ([p, s]: any) => [Number(p), Number(s)] as [number, number]
      ) ?? [],
  };
}
