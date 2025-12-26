import { ClickHouseClient } from "@clickhouse/client";
import { ClickHouseBatcher } from "./batcher";
import type { NormalizedTrade } from "../../../../shared/types/unified-market-data";

function toCHDateTime64ms(ms: number) {
  const d = new Date(ms);
  return d.toISOString().replace("T", " ").replace("Z", "");
}

export function createTradesIngestor(ch: ClickHouseClient) {
  const batcher = new ClickHouseBatcher({
    name: "trades",
    maxRows: 5000,
    flushIntervalMs: 200,
    insert: async (rows) => {
      await ch.insert({
        table: "trades",
        format: "JSONEachRow",
        values: rows,
      });
    },
  });

  batcher.start();

  return {
    ingest(trade: NormalizedTrade) {
      batcher.push({
        exchange: trade.exchange,
        symbol: trade.symbol,
        ts_event: toCHDateTime64ms(trade.ts_event),
        ts_recv: toCHDateTime64ms(trade.ts_recv),
        price: trade.price,
        size: trade.size,
        side: trade.side,
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
