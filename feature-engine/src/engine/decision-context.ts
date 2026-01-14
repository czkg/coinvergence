export type DecisionContext = {
  ts: number;
  exchange: string;
  symbol: string;
  market: unknown;   // MarketState snapshot
  features: Record<string, unknown>;
};
