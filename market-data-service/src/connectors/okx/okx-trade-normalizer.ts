import { NormalizedTrade } from "../../../../shared/types/unified-market-data";
import { normalizeSymbol } from "../../core/symbol-normalizer";

/**
 * Normalize OKX trade WS messages.
 * OKX provides taker side directly.
 */
export function normalizeOKXTrade(
  msg: any
): NormalizedTrade[] | null {
  if (!msg?.arg || msg.arg.channel !== "trades") return null;
  if (!Array.isArray(msg.data)) return null;

  const symbol = normalizeSymbol("okx", msg.arg.instId);
  const ts_recv = Date.now();

  return msg.data.map(
    (t: any): NormalizedTrade => ({
      type: "trade",
      exchange: "okx",
      symbol,
      price: Number(t.px),
      size: Number(t.sz),
      side: t.side,              // buy | sell
      ts_event: Number(t.ts),    // already ms
      ts_recv,
    })
  );
}
