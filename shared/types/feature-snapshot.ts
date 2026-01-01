export interface FeatureSnapshot {
  /** Identity */
  exchange: string;
  symbol: string;

  /** Timestamps (ms since epoch, monotonic source preferred) */
  ts_event: number; // feature reference time
  ts_recv: number;  // when snapshot was emitted

  /** Top-of-book */
  mid: number;
  spread: number;

  /** Returns (log returns recommended) */
  returns_1s?: number;
  returns_5s?: number;

  /** Order Flow Imbalance */
  ofi_1s?: number;
  ofi_5s?: number;

  /** Microstructure */
  microprice?: number;

  /** Debug / evolution hooks */
  depth_levels?: number;     // how many levels were used
  version: number;           // schema version
}
