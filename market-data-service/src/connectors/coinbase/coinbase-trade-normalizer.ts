import { NormalizedTrade } from "@shared/types/unified-market-data";

/**
 * Normalize Coinbase trade (match) events.
 */
export function normalizeCoinbaseTrade(
  raw: any
): NormalizedTrade | null {
  if (!raw || raw.type !== "match") return null;

  return {
    type: "trade",
    exchange: "coinbase",
    symbol: raw.product_id,
    price: Number(raw.price),
    size: Number(raw.size),
    side: raw.side, // buy | sell
    ts_event: Date.parse(raw.time),
    ts_recv: Date.now(),
  };
}
