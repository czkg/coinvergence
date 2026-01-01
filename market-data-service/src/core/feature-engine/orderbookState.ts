import type { NormalizedOrderBookUpdate } from "@shared/types/unified-market-data";

type Side = "bid" | "ask";

type Level = {
  price: number;
  size: number;
};

type TopOfBook = {
  bidPrice: number;
  bidSize: number;
  askPrice: number;
  askSize: number;
  ts: number;
};

export class OrderBookState {
  private bestBid?: Level;
  private bestAsk?: Level;

  // === NEW: top-of-book history ===
  private topHistory: TopOfBook[] = [];
  private readonly maxHistoryMs = 10_000;

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

    // === NEW: record top after applying update ===
    this.recordTop(update.ts_recv);
  }

  private reset() {
    this.bestBid = undefined;
    this.bestAsk = undefined;
    this.topHistory = [];
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

  // =====================
  // Public getters
  // =====================

  getBestBid(): Level | undefined {
    return this.bestBid;
  }

  getBestAsk(): Level | undefined {
    return this.bestAsk;
  }

  isReady(): boolean {
    return !!this.bestBid && !!this.bestAsk;
  }

  /**
   * NEW: get top-of-book history within a rolling window
   */
  getTopHistory(windowMs: number): TopOfBook[] {
    const cutoff = Date.now() - windowMs;
    return this.topHistory.filter(x => x.ts >= cutoff);
  }

  getTop(): TopOfBook | null {
    if (!this.isReady()) return null;
    return {
      bidPrice: this.bestBid!.price,
      bidSize: this.bestBid!.size,
      askPrice: this.bestAsk!.price,
      askSize: this.bestAsk!.size,
      ts: Date.now(),
    };
  }

  // =====================
  // Internal helpers
  // =====================

  private recordTop(ts: number) {
    if (!this.isReady()) return;

    this.topHistory.push({
      bidPrice: this.bestBid!.price,
      bidSize: this.bestBid!.size,
      askPrice: this.bestAsk!.price,
      askSize: this.bestAsk!.size,
      ts,
    });

    this.evictOldHistory(ts);
  }

  private evictOldHistory(now: number) {
    const cutoff = now - this.maxHistoryMs;
    while (this.topHistory.length > 0 && this.topHistory[0].ts < cutoff) {
      this.topHistory.shift();
    }
  }
}
