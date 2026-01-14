import { MarketState } from "../engine/market-state";
import { MarketEvent } from "../types/events";

export interface Feature<T> {
  readonly name: string;

  onEvent?(event: MarketEvent, state: MarketState): void;
  value(state: MarketState): T;
  snapshot?(): unknown;
}
