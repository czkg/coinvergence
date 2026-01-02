import { NormalizedTrade } from "@shared/types/unified-market-data";
import { normalizeSymbol } from "../../core/symbol-normalizer";

/**
 * Normalize Kraken trade WS messages.
 */
export function normalizeKrakenTrade(
  msg: any
): NormalizedTrade[] | null {
  if (!Array.isArray(msg) || msg.length < 4) return null;

  const data = msg[1];
  const channelName = msg[2];
  const rawSymbol = msg[3];

  if (channelName !== "trade") return null;
  if (!Array.isArray(data)) return null;

  const symbol = normalizeSymbol("kraken", rawSymbol);
  const ts_recv = Date.now();

  return data.map(
    ([price, size, ts, side]: any): NormalizedTrade => ({
      type: "trade",
      exchange: "kraken",
      symbol,
      price: Number(price),
      size: Number(size),
      side: side === "b" ? "buy" : "sell",
      ts_event: Math.floor(Number(ts) * 1000),
      ts_recv
    })
  );
}
