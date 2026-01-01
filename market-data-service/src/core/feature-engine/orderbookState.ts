import type { NormalizedOrderBookUpdate } from "@shared/types/unified-market-data";

type Side = "bid" | "ask";

type Level = {
  price: number;
  size: number;
};

export class OrderBookState {
  private bestBid?: Level;
  private bestAsk?: Level;

  constructor(
    public readonly exchange: string,
    public readonly symbol: string
  ) {}

  /**
   * Apply a normalized order book update (snapshot or diff)
   */
  apply(update: NormalizedOrderBookUpdate) {
    if (update.snapshot) {
      this.reset();
    }

    this.applySide("bid", update.bids);
    this.applySide("ask", update.asks);
  }

  private reset() {
    this.bestBid = undefined;
    this.bestAsk = undefined;
  }

  private applySide(side: Side, updates: [number, number][]) {
    for (const [price, size] of updates) {
      if (side === "bid") {
        this.updateBestBid(price, size);
      } else {
        this.updateBestAsk(price, size);
      }
    }
  }

  private updateBestBid(price: number, size: number) {
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

  private updateBestAsk(price: number, size: number) {
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
    return !!this.bestBid && !!this.bestAsk;
  }
}
