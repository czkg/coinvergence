import { MarketState } from "./market-state";
import { MarketEvent } from "../types/events";
import { Feature } from "../features/feature";
import { FeatureRegistry } from "../features/registry";
import { DecisionContext } from "./decision-context";

export class FeatureEngine {
  private readonly state: MarketState;
  private readonly registry: FeatureRegistry;

  constructor(opts: {
    exchange: string;
    symbol: string;
    features: Feature<any>[];
  }) {
    this.state = new MarketState(opts.exchange, opts.symbol);
    this.registry = new FeatureRegistry(opts.features);
  }

  /** 核心：推进一个事件 */
  apply(event: MarketEvent): DecisionContext {
    // 1. 更新市场状态
    this.state.apply(event);

    // 2. 通知所有 feature
    this.registry.onEvent(event, this.state);

    // 3. 生成决策上下文
    return {
      ts: event.ts,
      exchange: this.state.exchange,
      symbol: this.state.symbol,
      market: this.state.snapshot(),
      features: this.registry.values(this.state)
    };
  }
}
