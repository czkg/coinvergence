export interface FeatureSnapshot {
  symbol: string;
  ts_event: number;
  ts_recv: number;

  mid: number;
  spread: number;

  returns_1s: number;
  returns_5s: number;

  ofi_1s: number;
  ofi_5s: number;

  microprice: number;
}
