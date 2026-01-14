import { Feature } from "./feature";
import { MarketEvent } from "../types/events";
import { MarketState } from "../engine/market-state";

export class FeatureRegistry {
  private readonly features: Feature<any>[];

  constructor(features: Feature<any>[]) {
    this.features = features;
  }

  onEvent(event: MarketEvent, state: MarketState) {
    for (const f of this.features) {
      f.onEvent?.(event, state);
    }
  }

  values(state: MarketState): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const f of this.features) {
      out[f.name] = f.value(state);
    }
    return out;
  }

  snapshot() {
    const out: Record<string, unknown> = {};
    for (const f of this.features) {
      if (f.snapshot) {
        out[f.name] = f.snapshot();
      }
    }
    return out;
  }
}
