/**
 * One-off runner for real market data ingestion.
 *
 * Binance → MarketDataEmitter → ingestTrades → ClickHouse
 *
 * Assumptions (IMPORTANT):
 * - MarketDataEmitter emits UnifiedMarketData with `type` field
 * - trade events have: type === "trade"
 * - orderbook events are ignored in this runner
 */

import { BinanceConnector } from "../connectors/binance/binance-connector";
import { marketDataEmitter } from "../core/market-data-emitter";
import { createTradesIngestor } from "../infra/clickhouse/ingestTrades";
import { createCH } from "../infra/clickhouse/client";
import type { UnifiedMarketData } from "@shared/types/unified-market-data";

const SYMBOL = "BTCUSDT";

async function main() {
  console.log("[Runner] starting Binance BTCUSDT ingestion");

  // 1️⃣ Create ClickHouse client
  const ch = createCH();

  // 2️⃣ Create trade ingestor (starts batcher internally)
  const tradesIngestor = createTradesIngestor(ch);

  // 3️⃣ 🔥 WIRING: UnifiedMarketData → trade-only ingestion
  const unsubscribe = marketDataEmitter.subscribe(
    (event: UnifiedMarketData) => {
      if (event.type !== "trade") return;

      console.log("[Runner] trade event received");
      tradesIngestor.ingest(event);
    }
  );

  console.log("[Runner] trade ingestor subscribed");

  // 4️⃣ Start Binance connector
  const connector = new BinanceConnector([SYMBOL]);

  await connector.connect();
  console.log("[Runner] connector.connect() called");

  // 5️⃣ Graceful shutdown
  async function shutdown() {
    console.log("[Runner] shutting down...");

    unsubscribe();

    // Flush remaining rows
    await tradesIngestor.flush();
    tradesIngestor.stop();

    console.log("[Runner] exit");
    process.exit(0);
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("[Runner] fatal error", err);
  process.exit(1);
});
