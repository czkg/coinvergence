type Level = {
  price: number;
  size: number;
};

export class OrderBookState {
  private bids = new Map<number, number>();
  private asks = new Map<number, number>();

  private lastTs?: number;

  apply(event: {
    ts: number;
    bids: [number, number][];
    asks: [number, number][];
    snapshot: boolean;
  }) {
    if (event.snapshot) {
      this.bids.clear();
      this.asks.clear();
    }

    for (const [price, size] of event.bids) {
      size === 0 ? this.bids.delete(price) : this.bids.set(price, size);
    }
    for (const [price, size] of event.asks) {
      size === 0 ? this.asks.delete(price) : this.asks.set(price, size);
    }

    this.lastTs = event.ts;
  }

  bestBid(): Level | undefined {
    let max = -Infinity;
    let size = 0;
    for (const [p, s] of this.bids) {
      if (p > max) {
        max = p;
        size = s;
      }
    }
    return max === -Infinity ? undefined : { price: max, size };
  }

  bestAsk(): Level | undefined {
    let min = Infinity;
    let size = 0;
    for (const [p, s] of this.asks) {
      if (p < min) {
        min = p;
        size = s;
      }
    }
    return min === Infinity ? undefined : { price: min, size };
  }

  depth(n: number) {
    const bids = [...this.bids.entries()]
      .sort((a, b) => b[0] - a[0])
      .slice(0, n)
      .map(([price, size]) => ({ price, size }));

    const asks = [...this.asks.entries()]
      .sort((a, b) => a[0] - b[0])
      .slice(0, n)
      .map(([price, size]) => ({ price, size }));

    return { bids, asks };
  }

  snapshot() {
    return {
      ts: this.lastTs,
      bids: [...this.bids.entries()],
      asks: [...this.asks.entries()],
    };
  }
}
