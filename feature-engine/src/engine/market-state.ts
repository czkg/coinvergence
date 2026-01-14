import type {
  NormalizedOrderBookUpdate,
  Exchange,
} from "@shared/types/unified-market-data";
import { OrderBookState } from "../features/orderbook/orderbookState";
import { MarketEvent } from "../types/events";

export class MarketState {
  readonly exchange: Exchange;
  readonly symbol: string;

  readonly orderBook: OrderBookState;

  // ✅ NEW: last event timestamp (event-time) for replay-safe features
  lastEventTs: number = 0;

  constructor(exchange: Exchange, symbol: string) {
    this.exchange = exchange;
    this.symbol = symbol;
    this.orderBook = new OrderBookState(exchange, symbol);
  }

  apply(event: MarketEvent): void {
    // ✅ record event-time (replay safe)
    this.lastEventTs = event.ts;

    if (event.type === "orderbook") {
      const update: NormalizedOrderBookUpdate = {
        // ✅ your NormalizedOrderBookUpdate requires type
        type: "orderbook",
        exchange: this.exchange,
        symbol: this.symbol,

        ts_event: event.ts,
        ts_recv: event.ts,

        bids: event.bids,
        asks: event.asks,

        snapshot: event.snapshot,
      };

      this.orderBook.apply(update);
    }
  }

  snapshot() {
    return {
      exchange: this.exchange,
      symbol: this.symbol,
      orderBook: {
        bestBid: this.orderBook.getBestBid(),
        bestAsk: this.orderBook.getBestAsk(),
      },
    };
  }
}
