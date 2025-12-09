import WebSocket from "ws";
import { normalizeKrakenMessage } from "./kraken-normalizer";
import { marketDataEmitter } from "../../core/market-data-emitter";

export class KrakenConnector {
  private ws: WebSocket | null = null;

  constructor(private symbols: readonly string[]) {}

  connect() {
    const url = "wss://ws.kraken.com";
    this.ws = new WebSocket(url);

    this.ws.on("open", () => {
      console.log("[Kraken] connected");

      this.ws!.send(JSON.stringify({
        event: "subscribe",
        pair: this.symbols,
        subscription: { name: "book", depth: 100 }
      }));
    });

    this.ws.on("message", (msg) => {
      try {
        const json = JSON.parse(msg.toString());
        const unified = normalizeKrakenMessage(json);

        if (unified) {
          marketDataEmitter.emit(unified);
        }
      } catch (err) {
        console.error("[Kraken] parse error:", err);
      }
    });

    this.ws.on("close", () => {
      console.log("[Kraken] closed, reconnecting...");
      setTimeout(() => this.connect(), 2000);
    });

    this.ws.on("error", (err) => {
      console.error("[Kraken] ws error:", err);
    });
  }
}
