import { NormalizedTrade } from "@shared/types/unified-market-data";
import { normalizeSymbol } from "../../core/symbol-normalizer";

/**
 * Normalize Binance trade stream (@trade).
 * Binance uses `m` to indicate maker side.
 */
export function normalizeBinanceTrade(raw: any): NormalizedTrade | null {
  if (!raw || raw.e !== "trade") return null;

  return {
    type: "trade",
    exchange: "binance",
    symbol: normalizeSymbol("binance", raw.s),
    price: Number(raw.p),
    size: Number(raw.q),
    side: raw.m ? "sell" : "buy",
    ts_event: raw.E ?? Date.now(),
    ts_recv: Date.now(),
  };
}
