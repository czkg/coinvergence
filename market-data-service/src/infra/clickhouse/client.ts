import { createClient, ClickHouseClient } from "@clickhouse/client";

function mustGet(name: string, fallback?: string) {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export function createCH(): ClickHouseClient {
  const url = mustGet("CLICKHOUSE_URL", "http://localhost:8123");
  const username = mustGet("CLICKHOUSE_USER", "default");
  const password = process.env.CLICKHOUSE_PASSWORD ?? "";
  const database = mustGet("CLICKHOUSE_DB", "coinvergence");

  return createClient({
    url,
    username,
    password,
    database,
    // clickhouse-js client will use HTTP interface by default
  });
}
