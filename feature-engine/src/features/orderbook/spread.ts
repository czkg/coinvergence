import { Feature } from "../feature";
import { MarketState } from "../../engine/market-state";

/**
 * SpreadFeature
 *
 * Computes bid-ask spread from order book state.
 * Returns null if order book is not in a valid state.
 */
export class SpreadFeature implements Feature<number | null> {
  readonly name = "spread";

  value(state: MarketState): number | null {
    const ob = state.orderBook;

    if (!ob.isReady()) return null;

    const bid = ob.getBestBid();
    const ask = ob.getBestAsk();

    if (!bid || !ask) return null;
    if (ask.price <= 0 || bid.price <= 0) return null;
    if (ask.price < bid.price) return null;

    return ask.price - bid.price;
  }
}
