/**
 * Normalize exchange-specific symbols into unified format.
 * E.g. BTCUSDT → BTC-USD
 *      BTC-USD → BTC-USD
 *      XBT/USD → BTC-USD
 */
export function normalizeSymbol(exchange: string, raw: string): string {
  const map: Record<string, string> = {
    XBT: "BTC",
    USDT: "USD",
    USD: "USD",
  };

  const cleaned = raw.replace("/", "-").replace("_", "-").toUpperCase();

  // Example: BTCUSDT (Binance)
  if (/^[A-Z]{3,4}USD$/i.test(cleaned)) {
    const base = cleaned.replace("USD", "");
    return `${map[base] ?? base}-USD`;
  }

  // Example: XBT/USD
  if (cleaned.includes("-")) {
    const [base, quote] = cleaned.split("-");
    return `${map[base] ?? base}-${map[quote] ?? quote}`;
  }

  return cleaned;
}
