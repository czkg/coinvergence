import { ClickHouseClient } from "@clickhouse/client";
import { FeatureSnapshot } from "@shared/types/feature-snapshot";
import { ClickHouseBatcher } from "@shared/utils/batcher";

function toCHDateTime64(ms: number) {
  return new Date(ms).toISOString().replace("T", " ").replace("Z", "");
}

export function createFeatureEmitter(ch: ClickHouseClient) {
  const batcher = new ClickHouseBatcher({
    name: "features",
    maxRows: 2000,
    flushIntervalMs: 500,
    insert: async (rows) => {
      await ch.insert({
        table: "features",
        format: "JSONEachRow",
        values: rows,
      });
    },
  });

  batcher.start();

  return {
    emit(snapshot: FeatureSnapshot) {
      batcher.push({
        exchange: snapshot.exchange,
        symbol: snapshot.symbol,
        ts_event: toCHDateTime64(snapshot.ts_event),
        ts_recv: toCHDateTime64(snapshot.ts_recv),

        mid: snapshot.mid,
        spread: snapshot.spread,

        returns_1s: snapshot.returns_1s ?? null,
        returns_5s: snapshot.returns_5s ?? null,

        ofi_1s: snapshot.ofi_1s ?? null,
        ofi_5s: snapshot.ofi_5s ?? null,

        microprice: snapshot.microprice ?? null,
        depth_levels: snapshot.depth_levels ?? null,

        version: snapshot.version,
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
