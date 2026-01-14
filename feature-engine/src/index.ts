import { FeatureEngine } from "./engine/feature-engine";
import { replayMarket } from "./replay/replay";
import { MarketEvent } from "./types/events";

// ---- Feature imports ----
import { SpreadFeature } from "./features/orderbook/spread";

// ---- Replay source imports ----
import { clickhouseEventStream } from "./replay/clickhouse-source";

/**
 * Application entry point.
 *
 * Responsibilities:
 * - Assemble FeatureEngine
 * - Select event source (replay or live)
 * - Wire decision sink (logging / rules / AI / snapshot)
 *
 * index.ts MUST NOT contain:
 * - trading logic
 * - feature logic
 * - execution logic
 */
async function main(): Promise<void> {
  // 1. Construct FeatureEngine with selected features
  const engine = new FeatureEngine({
    exchange: "binance",
    symbol: "BTCUSDT",
    features: [
      new SpreadFeature()
    ]
  });

  // 2. Select event source
  // TODO: Inject real ClickHouse client here
  const clickhouseClient = undefined;

  const eventSource: AsyncIterable<MarketEvent> =
    clickhouseEventStream(
      clickhouseClient,
      "SELECT * FROM market_events ORDER BY ts_event"
    );

  // 3. Run replay (or live pipeline)
  await replayMarket(eventSource, engine, {
    onDecision: (ctx) => {
      console.log(
        `[${ctx.exchange} ${ctx.symbol}] ts=${ctx.ts}`,
        ctx.features
      );
    }
  });
}

// ---- Process bootstrap ----
main().catch((err) => {
  console.error("Feature-engine failed to start:", err);
  process.exit(1);
});
