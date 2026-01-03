import WebSocket from "ws";
import { marketDataEmitter } from "../../core/market-data-emitter";
import { normalizeOKXOrderBook } from "./okx-orderbook-normalizer";
import { normalizeOKXTrade } from "./okx-trade-normalizer";

export class OKXConnector {
  constructor(private symbols: string[]) {}

  connect() {
    const ws = new WebSocket("wss://ws.okx.com:8443/ws/v5/public");

    ws.on("open", () => {
      console.log("[OKX] websocket connected");

      ws.send(
        JSON.stringify({
          op: "subscribe",
          args: this.symbols.flatMap((s) => [
            { channel: "books", instId: s },
            { channel: "trades", instId: s }
          ])
        })
      );
    });

    ws.on("message", (msg) => {
      try {
        const parsed = JSON.parse(msg.toString());

        // --------------------------------------------------
        // SUBSCRIPTION CONFIRMATION (log like Binance)
        // --------------------------------------------------
        if (parsed?.event === "subscribe" && parsed.arg) {
          const { channel, instId } = parsed.arg;

          if (channel === "books") {
            console.log(`[OKX] orderbook connected: ${instId}`);
          }

          if (channel === "trades") {
            console.log(`[OKX] trade connected: ${instId}`);
          }

          return;
        }

        // --------------------------------------------------
        // ORDERBOOK
        // --------------------------------------------------
        const ob = normalizeOKXOrderBook(parsed);
        if (ob) {
          marketDataEmitter.emit(ob);
        }

        // --------------------------------------------------
        // TRADE (may be multiple)
        // --------------------------------------------------
        const trades = normalizeOKXTrade(parsed);
        if (trades) {
          trades.forEach((t) => marketDataEmitter.emit(t));
        }
      } catch (err) {
        console.error("[OKX] parse error:", err);
      }
    });

    ws.on("close", () => {
      console.log("[OKX] websocket closed, reconnecting...");
      setTimeout(() => this.connect(), 2000);
    });

    ws.on("error", (err) => {
      console.error("[OKX] ws error:", err);
    });
  }
}
