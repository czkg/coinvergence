import WebSocket from "ws";
import { marketDataEmitter } from "../../core/market-data-emitter";
import { normalizeBinanceDepth } from "./binance-normalizer";
import { normalizeSymbol } from "../../core/symbol-normalizer";

export class BinanceConnector {
  constructor(private symbols: readonly string[]) {}

  connect() {
    console.log("[Binance] connecting...");

    this.symbols.forEach((sym) => {
      const binanceSymbol = sym.replace("-", "").toLowerCase(); // BTC-USD → btcusd

      const url = `wss://stream.binance.com:9443/ws/${binanceSymbol}@depth`;

      const ws = new WebSocket(url);

      ws.on("open", () => {
        console.log(`[Binance] connected: ${sym}`);
      });

      ws.on("message", (msg) => {
        try {
          const raw = JSON.parse(msg.toString());
          const unified = normalizeBinanceDepth(raw, sym);

          if (unified) {
            marketDataEmitter.emit(unified);
          }
        } catch (err) {
          console.error("[Binance] parse error:", err);
        }
      });

      ws.on("close", () => {
        console.log("[Binance] closed, reconnecting...");
        setTimeout(() => this.connect(), 2000);
      });

      ws.on("error", (err) => {
        console.error("[Binance] ws error:", err);
      });
    });
  }
}
