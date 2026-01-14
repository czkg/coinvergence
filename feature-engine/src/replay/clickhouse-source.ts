import { MarketEvent } from "../types/events";

export async function* clickhouseEventStream(
  client: any,
  query: string
): AsyncIterable<MarketEvent> {
  const rows = await client.query(query);

  for await (const r of rows.stream()) {
    if (r.type === "trade") {
      yield {
        type: "trade",
        ts: r.ts_event,
        exchange: r.exchange,
        symbol: r.symbol,
        price: r.price,
        size: r.size,
        side: r.side
      };
    } else {
      yield {
        type: "orderbook",
        ts: r.ts_event,
        exchange: r.exchange,
        symbol: r.symbol,
        bids: r.bids,
        asks: r.asks,
        snapshot: r.snapshot
      };
    }
  }
}
