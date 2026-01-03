// src/main.ts

import { marketDataEmitter } from "./core/market-data-emitter";

import { createCH } from "./infra/clickhouse/client";
import { createTradesIngestor } from "./infra/clickhouse/ingestTrades";
import { createOrderBookEventsIngestor } from "./infra/clickhouse/ingestOrderBookEvents";
import { createOrderBookLevelsIngestor } from "./infra/clickhouse/ingestOrderBookLevels";

import { BinanceConnector } from "./connectors/binance/binance-connector";
import { CoinbaseConnector } from "./connectors/coinbase/coinbase-connector";
import { KrakenConnector } from "./connectors/kraken/kraken-connector";
import { OKXConnector } from "./connectors/okx/okx-connector";

async function main() {
  console.log("[MarketDataService] starting...");

  // -----------------------------
  // Infra
  // -----------------------------
  const ch = createCH();

  const tradeIngestor = createTradesIngestor(ch);
  const obEventIngestor = createOrderBookEventsIngestor(ch);
  const obLevelIngestor = createOrderBookLevelsIngestor(ch);

  // -----------------------------
  // Wiring (single fan-in)
  // -----------------------------
  const unsubscribe = marketDataEmitter.subscribe((event) => {
    switch (event.type) {
      case "trade":
        tradeIngestor.ingest(event);
        break;

      case "orderbook":
        obEventIngestor.ingest(event);
        obLevelIngestor.ingest(event);
        break;

      default:
        // future-proof
        break;
    }
  });

  // -----------------------------
  // Symbols (canonical)
  // -----------------------------
  const SYMBOLS = {
    binance: ["BTCUSDT"],
    coinbase: ["BTC-USD"],
    kraken: ["BTC/USD"],
    okx: ["BTC-USDT"],
  };

  // -----------------------------
  // Connectors (parallel)
  // -----------------------------
  const connectors = [
    new BinanceConnector(SYMBOLS.binance),
    new CoinbaseConnector(SYMBOLS.coinbase),
    new KrakenConnector(SYMBOLS.kraken),
    new OKXConnector(SYMBOLS.okx),
  ];

  connectors.forEach((c) => c.connect());

  console.log("[MarketDataService] all connectors started");

  // -----------------------------
  // Graceful shutdown
  // -----------------------------
  let shuttingDown = false;

  async function shutdown() {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log("[MarketDataService] shutting down...");

    unsubscribe();

    await tradeIngestor.flush();
    await obEventIngestor.flush();
    await obLevelIngestor.flush();

    tradeIngestor.stop();
    obEventIngestor.stop();
    obLevelIngestor.stop();

    process.exit(0);
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("[MarketDataService] fatal error", err);
  process.exit(1);
});
