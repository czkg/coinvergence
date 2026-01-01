import { UnifiedMarketData } from "@shared/types/unified-market-data";

type MarketDataHandler = (data: UnifiedMarketData) => void | Promise<void>;

/**
 * MarketDataEmitter
 * ---------------------------------------
 * Internal in-memory event bus for market data.
 *
 * Responsibilities:
 * - Accept UnifiedMarketData from all connectors (Binance/Coinbase/etc)
 * - Broadcast to any number of subscribers (feature-engine / ai-model / router)
 * - Non-blocking delivery: connector must never wait for subscribers
 * - Consistent interface allowing future integration with Redis/Kafka
 *
 * This is the ONLY place in market-data-service where events are emitted.
 */
export class MarketDataEmitter {
  private subscribers: Set<MarketDataHandler> = new Set();

  /**
   * Subscribe to market data stream.
   *
   * A subscriber should NEVER perform heavy work inside the handler.
   * Instead, dispatch the event into a queue / async pipeline.
   */
  subscribe(handler: MarketDataHandler) {
    this.subscribers.add(handler);
    return () => this.subscribers.delete(handler); // return unsubscribe fn
  }

  /**
   * Emit a UnifiedMarketData event to all subscribers.
   *
   * Emission is asynchronous and non-blocking:
   * - Each handler is invoked in a microtask
   * - Errors inside handlers are isolated and logged
   */
  emit(event: UnifiedMarketData) {
    for (const handler of this.subscribers) {
      Promise.resolve()
        .then(() => handler(event))
        .catch((err) => {
          console.error("[MarketDataEmitter] handler error:", err);
        });
    }
  }
}

// Singleton instance (optional but recommended)
export const marketDataEmitter = new MarketDataEmitter();
