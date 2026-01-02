import { createCH } from "./infra/clickhouse/client";

import { marketDataEmitter } from "./core/market-data-emitter";

import { createTradesIngestor } from "./infra/clickhouse/ingestTrades";
import { createOrderBookEventsIngestor } from "./infra/clickhouse/ingestOrderBookEvents";
import { createOrderBookLevelsIngestor } from "./infra/clickhouse/ingestOrderBookLevels";

import { BinanceConnector } from "./connectors/binance/binance-connector";

async function main() {
  console.log("[MarketDataService] starting...");

  // 1️⃣ Infra
  const ch = createCH();

  // 2️⃣ Ingestors
  const tradeIngestor = createTradesIngestor(ch);
  const orderBookEventsIngestor = createOrderBookEventsIngestor(ch);
  const orderBookLevelsIngestor = createOrderBookLevelsIngestor(ch);

  // 3️⃣ Wiring (the heart)
  const unsubscribe = marketDataEmitter.subscribe((event) => {
    switch (event.type) {
      case "trade":
        tradeIngestor.ingest(event);
        break;

      case "orderbook":
        orderBookEventsIngestor.ingest(event);
        orderBookLevelsIngestor.ingest(event);
        break;

      default:
        // future-proofing
        break;
    }
  });

  // 4️⃣ Data sources
  const binance = new BinanceConnector(["BTCUSDT"]);
  await binance.connect();

  console.log("[MarketDataService] connected");

  // 5️⃣ Graceful shutdown
  async function shutdown() {
    console.log("[MarketDataService] shutting down...");

    unsubscribe();

    await tradeIngestor.flush();
    await orderBookEventsIngestor.flush();
    await orderBookLevelsIngestor.flush();

    tradeIngestor.stop();
    orderBookEventsIngestor.stop();
    orderBookLevelsIngestor.stop();

    process.exit(0);
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("[MarketDataService] fatal error", err);
  process.exit(1);
});
