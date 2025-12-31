import { ClickHouseClient } from "@clickhouse/client";
import { ClickHouseBatcher } from "./batcher";
import type { NormalizedQuote } from "../../../../shared/types/unified-market-data";

function toCHDateTime64ms(ms: number) {
  const d = new Date(ms);
  return d.toISOString().replace("T", " ").replace("Z", "");
}

export function createQuotesIngestor(ch: ClickHouseClient) {
  const batcher = new ClickHouseBatcher({
    name: "quotes",

    maxRows: 1000,
    flushIntervalMs: 50,

    insert: async (rows) => {
      await ch.insert({
        table: "quotes",
        format: "JSONEachRow",
        values: rows,
      });
    },
  });

  batcher.start();

  return {
    ingest(quote: NormalizedQuote) {
      batcher.push({
        exchange: quote.exchange,
        symbol: quote.symbol,

        ts_event: toCHDateTime64ms(quote.ts_event),
        ts_recv: toCHDateTime64ms(quote.ts_recv),

        bid: quote.bid,
        bid_size: quote.bidSize,

        ask: quote.ask,
        ask_size: quote.askSize,
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
