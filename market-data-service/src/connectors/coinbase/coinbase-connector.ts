import WebSocket from "ws";
import { marketDataEmitter } from "../../core/market-data-emitter";
import { normalizeCoinbaseOrderBook } from "./coinbase-orderbook-normalizer";
import { normalizeCoinbaseTrade } from "./coinbase-trade-normalizer";

export class CoinbaseConnector {
  private ws: WebSocket | null = null;

  constructor(private symbols: readonly string[]) {}

  connect() {
    const url = "wss://ws-feed.exchange.coinbase.com";
    this.ws = new WebSocket(url);

    this.ws.on("open", () => {
      console.log("[Coinbase] connected");

      this.ws!.send(
        JSON.stringify({
          type: "subscribe",
          product_ids: this.symbols,
          channels: [
            "level2",  // orderbook
            "matches", // trades
          ],
        })
      );
    });

    this.ws.on("message", (msg) => {
      try {
        const raw = JSON.parse(msg.toString());

        // -----------------------------
        // ORDERBOOK (snapshot + l2update)
        // -----------------------------
        const ob = normalizeCoinbaseOrderBook(raw);
        if (ob) {
          marketDataEmitter.emit(ob);
        }

        // -----------------------------
        // TRADE (match)
        // -----------------------------
        const trade = normalizeCoinbaseTrade(raw);
        if (trade) {
          marketDataEmitter.emit(trade);
        }
      } catch (err) {
        console.error("[Coinbase] parse error:", err);
      }
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
