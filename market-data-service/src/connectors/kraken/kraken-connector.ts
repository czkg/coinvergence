import WebSocket from "ws";
import { marketDataEmitter } from "../../core/market-data-emitter";
import { normalizeKrakenOrderBook } from "./kraken-orderbook-normalizer";
import { normalizeKrakenTrade } from "./kraken-trade-normalizer";

export class KrakenConnector {
  private ws: WebSocket | null = null;

  constructor(private symbols: readonly string[]) {}

  connect() {
    const url = "wss://ws.kraken.com";
    this.ws = new WebSocket(url);

    this.ws.on("open", () => {
      console.log("[Kraken] connected");

      // -----------------------------
      // ORDERBOOK
      // -----------------------------
      this.ws!.send(
        JSON.stringify({
          event: "subscribe",
          pair: this.symbols,
          subscription: { name: "book", depth: 100 }
        })
      );

      // -----------------------------
      // TRADE
      // -----------------------------
      this.ws!.send(
        JSON.stringify({
          event: "subscribe",
          pair: this.symbols,
          subscription: { name: "trade" }
        })
      );
    });

    this.ws.on("message", (msg) => {
      try {
        const json = JSON.parse(msg.toString());

        // -----------------------------
        // ORDERBOOK
        // -----------------------------
        const ob = normalizeKrakenOrderBook(json);
        if (ob) {
          marketDataEmitter.emit(ob);
        }

        // -----------------------------
        // TRADE (may be multiple)
        // -----------------------------
        const trades = normalizeKrakenTrade(json);
        if (trades) {
          trades.forEach(trade => marketDataEmitter.emit(trade));
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
