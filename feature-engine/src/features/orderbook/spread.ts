import { Feature } from "../feature";
import { MarketState } from "../../engine/market-state";

/**
 * SpreadFeature
 *
 * Computes best ask - best bid from the order book.
 * Returns null if either side is missing.
 */
export class SpreadFeature implements Feature<number | null> {
  readonly name = "spread";

  value(state: MarketState): number | null {
    const bid = state.orderBook.bestBid();
    const ask = state.orderBook.bestAsk();

    if (!bid || !ask) {
      return null;
    }

    return ask.price - bid.price;
  }
}
