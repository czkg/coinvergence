export type MarketEvent =
  | {
      type: "trade";
      ts: number;
      exchange: string;
      symbol: string;
      price: number;
      size: number;
      side: "buy" | "sell";
    }
  | {
      type: "orderbook";
      ts: number;
      exchange: string;
      symbol: string;
      bids: [number, number][];
      asks: [number, number][];
      snapshot: boolean;
    };
