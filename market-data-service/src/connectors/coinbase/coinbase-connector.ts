import WebSocket from "ws";
import { normalizeCoinbaseUpdate } from "./coinbase-normalizer";
import { marketDataEmitter } from "../../core/market-data-emitter";

export class CoinbaseConnector {
  private ws: WebSocket | null = null;

  constructor(private symbols: readonly string[]) {}

  connect() {
    const url = "wss://ws-feed.exchange.coinbase.com";
    this.ws = new WebSocket(url);

    this.ws.on("open", () => {
      console.log("[Coinbase] connected");

      this.ws!.send(JSON.stringify({
        type: "subscribe",
        product_ids: this.symbols,
        channels: ["level2"]
      }));
    });

    this.ws.on("message", (msg) => {
      const raw = JSON.parse(msg.toString());

      const events = normalizeCoinbaseUpdate(raw);
      if (!events) return;

      events.forEach(event => marketDataEmitter.emit(event));
    });

    this.ws.on("close", () => {
      console.log("[Coinbase] closed, reconnecting...");
      setTimeout(() => this.connect(), 2000);
    });

    this.ws.on("error", (err) => {
      console.error("[Coinbase] ws error:", err);
    });
  }
}
