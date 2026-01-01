import { OrderBookState } from "./orderbookState";

/**
 * Order Flow Imbalance (OFI)
 *
 * Definition (top-of-book based):
 *   OFI = Σ(Δbid_size) - Σ(Δask_size)
 *
 * over a rolling time window.
 *
 * Positive  -> buying pressure
 * Negative  -> selling pressure
 */
export function computeOFI(
  ob: OrderBookState,
  windowMs: number
): number {
  const history = ob.getTopHistory(windowMs);
  if (history.length < 2) return 0;

  let ofi = 0;

  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1];
    const curr = history[i];

    // Ignore crossed / invalid states
    if (
      prev.bidPrice <= 0 ||
      prev.askPrice <= 0 ||
      curr.bidPrice <= 0 ||
      curr.askPrice <= 0
    ) {
      continue;
    }

    // Bid side contribution
    if (curr.bidPrice === prev.bidPrice) {
      ofi += curr.bidSize - prev.bidSize;
    } else if (curr.bidPrice > prev.bidPrice) {
      // Bid price improved → full size added
      ofi += curr.bidSize;
    } else {
      // Bid price worsened → liquidity removed
      ofi -= prev.bidSize;
    }

    // Ask side contribution (opposite sign)
    if (curr.askPrice === prev.askPrice) {
      ofi -= curr.askSize - prev.askSize;
    } else if (curr.askPrice < prev.askPrice) {
      // Ask price improved → liquidity added
      ofi -= curr.askSize;
    } else {
      // Ask price worsened → liquidity removed
      ofi += prev.askSize;
    }
  }

  return ofi;
}
