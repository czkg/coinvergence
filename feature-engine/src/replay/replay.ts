// src/replay/replay.ts

import { FeatureEngine } from "../engine/feature-engine";
import { MarketEvent } from "../types/events";
import { DecisionContext } from "../engine/decision-context";

/**
 * Options controlling replay behavior.
 *
 * - fromTs / toTs: optional time window filtering
 * - onDecision: callback invoked for every decision context
 */
export type ReplayOptions = {
  fromTs?: number;
  toTs?: number;
  onDecision?: (ctx: DecisionContext) => void;
};

/**
 * replayMarket
 *
 * Core responsibilities:
 * 1. Consume MarketEvent in chronological order
 * 2. Advance the FeatureEngine deterministically
 * 3. Emit DecisionContext to downstream consumers
 *
 * Design principles:
 * - Does NOT know where events come from (DB / file / live stream)
 * - Does NOT perform any business logic
 * - Acts purely as a time driver
 */
export async function replayMarket(
  source: AsyncIterable<MarketEvent>,
  engine: FeatureEngine,
  options: ReplayOptions = {}
): Promise<void> {
  const { fromTs, toTs, onDecision } = options;

  for await (const event of source) {
    // Optional time-based filtering
    if (fromTs !== undefined && event.ts < fromTs) continue;
    if (toTs !== undefined && event.ts > toTs) break;

    // Advance engine state and compute decision context
    const ctx = engine.apply(event);

    // Emit decision to downstream consumers (rules / AI / logging / snapshot)
    if (onDecision) {
      onDecision(ctx);
    }
  }
}
