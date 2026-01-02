import WebSocket from "ws";
import { marketDataEmitter } from "../../core/market-data-emitter";
import { normalizeBinanceOrderBook } from "./binance-orderbook-normalizer";
import { normalizeBinanceTrade } from "./binance-trade-normalizer";

export class BinanceConnector {
  constructor(private symbols: readonly string[]) {}

  connect() {
    console.log("[Binance] connecting...");

    this.symbols.forEach((sym) => {
      const binanceSymbol = sym.replace("-", "").toLowerCase(); // BTC-USD → btcusd

      // -----------------------------
      // ORDERBOOK (depth)
      // -----------------------------
      const depthUrl = `wss://stream.binance.us:9443/ws/${binanceSymbol}@depth`;
      const depthWs = new WebSocket(depthUrl);

      depthWs.on("open", () => {
        console.log(`[Binance] depth connected: ${sym}`);
      });

      depthWs.on("message", (msg) => {
        try {
          const raw = JSON.parse(msg.toString());
          const unified = normalizeBinanceOrderBook(raw, sym);

          if (unified) {
            marketDataEmitter.emit(unified);
          }
        } catch (err) {
          console.error("[Binance] depth parse error:", err);
        }
      });

      depthWs.on("close", () => {
        console.log(`[Binance] depth closed (${sym}), reconnecting...`);
        setTimeout(() => this.connect(), 2000);
      });

      depthWs.on("error", (err) => {
        console.error(`[Binance] depth ws error (${sym}):`, err);
      });

      // -----------------------------
      // TRADE
      // -----------------------------
      const tradeUrl = `wss://stream.binance.us:9443/ws/${binanceSymbol}@trade`;
      const tradeWs = new WebSocket(tradeUrl);

      tradeWs.on("open", () => {
        console.log(`[Binance] trade connected: ${sym}`);
      });

      tradeWs.on("message", (msg) => {
        try {
          const raw = JSON.parse(msg.toString());
          const trade = normalizeBinanceTrade(raw);

          if (trade) {
            marketDataEmitter.emit(trade);
          }
        } catch (err) {
          console.error("[Binance] trade parse error:", err);
        }
      });

      tradeWs.on("close", () => {
        console.log(`[Binance] trade closed (${sym}), reconnecting...`);
        setTimeout(() => this.connect(), 2000);
      });

      tradeWs.on("error", (err) => {
        console.error(`[Binance] trade ws error (${sym}):`, err);
      });
    });
  }
}
