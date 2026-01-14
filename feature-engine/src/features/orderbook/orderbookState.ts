import type { NormalizedOrderBookUpdate } from "@shared/types/unified-market-data";

type Side = "bid" | "ask";

type Level = {
  price: number;
  size: number;
};

/**
 * OrderBookState
 *
 * Holds the latest top-of-book state only.
 * No time window, no history, no wall-clock usage.
 */
export class OrderBookState {
  // NOTE:
  // Use explicit `Level | undefined` instead of optional property
  // to satisfy `exactOptionalPropertyTypes: true`
  private bestBid: Level | undefined;
  private bestAsk: Level | undefined;

  constructor(
    public readonly exchange: string,
    public readonly symbol: string
  ) {}

  /**
   * Apply a normalized order book update (snapshot or diff).
   */
  apply(update: NormalizedOrderBookUpdate): void {
    if (update.snapshot) {
      this.reset();
    }

    this.applySide("bid", update.bids);
    this.applySide("ask", update.asks);
  }

  private reset(): void {
    this.bestBid = undefined;
    this.bestAsk = undefined;
  }

  private applySide(side: Side, updates: [number, number][]): void {
    for (const [price, size] of updates) {
      if (side === "bid") {
        this.updateBestBid(price, size);
      } else {
        this.updateBestAsk(price, size);
      }
    }
  }

  private updateBestBid(price: number, size: number): void {
    if (size === 0) {
      if (this.bestBid?.price === price) {
        this.bestBid = undefined;
      }
      return;
    }

    if (!this.bestBid || price > this.bestBid.price) {
      this.bestBid = { price, size };
    }
  }

  private updateBestAsk(price: number, size: number): void {
    if (size === 0) {
      if (this.bestAsk?.price === price) {
        this.bestAsk = undefined;
      }
      return;
    }

    if (!this.bestAsk || price < this.bestAsk.price) {
      this.bestAsk = { price, size };
    }
  }

  getBestBid(): Level | undefined {
    return this.bestBid;
  }

  getBestAsk(): Level | undefined {
    return this.bestAsk;
  }

  isReady(): boolean {
    return this.bestBid !== undefined && this.bestAsk !== undefined;
  }
}
