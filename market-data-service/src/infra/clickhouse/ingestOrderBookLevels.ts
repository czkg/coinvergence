import { ClickHouseClient } from "@clickhouse/client";
import { ClickHouseBatcher } from "./batcher";
import type { NormalizedOrderBookUpdate } from "@shared/types/unified-market-data";

function toCHDateTime64ms(ms: number) {
  const d = new Date(ms);
  return d.toISOString().replace("T", " ").replace("Z", "");
}

type LevelRow = {
  exchange: string;
  symbol: string;
  ts_event: string;
  side: "bid" | "ask";
  price: number;
  size: number;
  level: number;
};

export function createOrderBookLevelsIngestor(ch: ClickHouseClient) {
  const batcher = new ClickHouseBatcher({
    name: "orderbook_levels",

    maxRows: 20_000,
    flushIntervalMs: 500,

    insert: async (rows) => {
      await ch.insert({
        table: "orderbook_levels",
        format: "JSONEachRow",
        values: rows,
      });
    },
  });


  batcher.start();

  return {
    ingest(update: NormalizedOrderBookUpdate) {
      const ts_event = toCHDateTime64ms(update.ts_event);

      // bids
      for (let i = 0; i < update.bids.length; i++) {
        const [price, size] = update.bids[i];
        if (size <= 0) continue;

        batcher.push({
          exchange: update.exchange,
          symbol: update.symbol,
          ts_event,
          side: "bid",
          price,
          size,
          level: i + 1,
        });
      }

      // asks
      for (let i = 0; i < update.asks.length; i++) {
        const [price, size] = update.asks[i];
        if (size <= 0) continue;

        batcher.push({
          exchange: update.exchange,
          symbol: update.symbol,
          ts_event,
          side: "ask",
          price,
          size,
          level: i + 1,
        });
      }
    },

    async flush() {
      await batcher.flush();
    },

    stop() {
      batcher.stop();
    },
  };
}
