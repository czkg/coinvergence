import { OrderBookState } from "../state/orderbook/orderbook-state";
import { MarketEvent } from "../types/events";

export class MarketState {
  readonly exchange: string;
  readonly symbol: string;

  readonly orderBook: OrderBookState;
  // future:
  // readonly trades: TradeState;

  constructor(exchange: string, symbol: string) {
    this.exchange = exchange;
    this.symbol = symbol;
    this.orderBook = new OrderBookState();
  }

  apply(event: MarketEvent) {
    if (event.type === "orderbook") {
      this.orderBook.apply(event);
    }
  }

  snapshot() {
    return {
      exchange: this.exchange,
      symbol: this.symbol,
      orderBook: this.orderBook.snapshot(),
    };
  }
}
