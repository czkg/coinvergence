import { ClickHouseClient } from "@clickhouse/client";
import { ClickHouseBatcher } from "@shared/utils/batcher";
import type { NormalizedOrderBookUpdate } from "@shared/types/unified-market-data";

function toCHDateTime64ms(ms: number) {
  const d = new Date(ms);
  return d.toISOString().replace("T", " ").replace("Z", "");
}

export function createOrderBookEventsIngestor(ch: ClickHouseClient) {
  const batcher = new ClickHouseBatcher({
    name: "orderbook_events",

    maxRows: 200,
    flushIntervalMs: 50,

    insert: async (rows) => {
      await ch.insert({
        table: "orderbook_events",
        format: "JSONEachRow",
        values: rows,
      });
    },
  });

  batcher.start();

  return {
    ingest(event: NormalizedOrderBookUpdate) {
      batcher.push({
        exchange: event.exchange,
        symbol: event.symbol,

        ts_event: toCHDateTime64ms(event.ts_event),
        ts_recv: toCHDateTime64ms(event.ts_recv),

        snapshot: event.snapshot ? 1 : 0,

        // ClickHouse Array(Tuple(Float64, Float64))
        bids: event.bids,
        asks: event.asks,
      });
    },

    async flush() {
      await batcher.flush();
    },

    stop() {
      batcher.stop();
    },
  };
}
