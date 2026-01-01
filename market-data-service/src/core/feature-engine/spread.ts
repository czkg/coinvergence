import { OrderBookState } from "./orderbookState";

export type SpreadFeature = {
  best_bid: number;
  best_ask: number;
  spread: number;
  mid: number;
};

export function computeSpread(
  ob: OrderBookState
): SpreadFeature | null {
  if (!ob.isReady()) return null;

  const bid = ob.getBestBid()!;
  const ask = ob.getBestAsk()!;

  const spread = ask.price - bid.price;
  const mid = (ask.price + bid.price) / 2;

  return {
    best_bid: bid.price,
    best_ask: ask.price,
    spread,
    mid,
  };
}
