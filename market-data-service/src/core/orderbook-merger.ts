export interface PriceLevelMap {
  [price: string]: number; // price → size
}

export class OrderBookMerger {
  private bids: PriceLevelMap = {};
  private asks: PriceLevelMap = {};

  /** Apply a full snapshot */
  applySnapshot(snapshot: {
    bids: [number, number][];
    asks: [number, number][];
  }) {
    this.bids = {};
    this.asks = {};

    snapshot.bids.forEach(([p, s]) => {
      if (s > 0) this.bids[p.toString()] = s;
    });

    snapshot.asks.forEach(([p, s]) => {
      if (s > 0) this.asks[p.toString()] = s;
    });
  }

  /** Apply a diff update */
  applyDiff(diff: {
    bids: [number, number][];
    asks: [number, number][];
  }) {
    diff.bids.forEach(([p, s]) => {
      const key = p.toString();
      if (s === 0) delete this.bids[key];
      else this.bids[key] = s;
    });

    diff.asks.forEach(([p, s]) => {
      const key = p.toString();
      if (s === 0) delete this.asks[key];
      else this.asks[key] = s;
    });
  }

  /** Export sorted orderbook for UnifiedMarketData emission */
  getL2(): {
    bids: [number, number][];
    asks: [number, number][];
  } {
    const bidsArray = Object.entries(this.bids)
      .map(([p, s]) => [parseFloat(p), s] as [number, number])
      .sort((a, b) => b[0] - a[0]);

    const asksArray = Object.entries(this.asks)
      .map(([p, s]) => [parseFloat(p), s] as [number, number])
      .sort((a, b) => a[0] - b[0]);

    return { bids: bidsArray, asks: asksArray };
  }
}
