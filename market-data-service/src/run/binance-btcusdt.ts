/**
 * One-off runner for real market data ingestion.
 *
 * Purpose:
 * - Single exchange
 * - Single symbol
 * - Real websocket
 * - Real persistence
 *
 * NOT production main.
 */

import { BinanceConnector } from "../connectors/binance/binance-connector";

const SYMBOL = "BTCUSDT";

async function main() {
  console.log("[Runner] starting Binance BTCUSDT ingestion");

  const connector = new BinanceConnector([SYMBOL]);

  // ---- optional but STRONGLY recommended ----
  // If your connector exposes hooks / events, log them.
  // This saves you hours of guessing.
  if ("on" in connector) {
    // @ts-ignore
    connector.on("connected", () => {
      console.log("[Runner] websocket connected");
    });

    // @ts-ignore
    connector.on("disconnected", (reason: any) => {
      console.warn("[Runner] websocket disconnected", reason);
    });

    // @ts-ignore
    connector.on("error", (err: any) => {
      console.error("[Runner] connector error", err);
    });
  }

  // ---- start streaming ----
  await connector.connect();

  console.log("[Runner] connector.connect() called");

  // ---- keep process alive intentionally ----
  // This is a runner, not a service.
  // Let Node stay up as long as websockets are alive.
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

let shuttingDown = false;

async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log("[Runner] shutting down...");

  // If you have a close / disconnect API, call it here
  // await connector.disconnect()

  // Give async flushers (ClickHouse batchers) time to finish
  setTimeout(() => {
    console.log("[Runner] exit");
    process.exit(0);
  }, 1000);
}

main().catch((err) => {
  console.error("[Runner] fatal error", err);
  process.exit(1);
});
