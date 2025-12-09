import { BinanceConnector } from "./connectors/binance/binance-connector";
import { CoinbaseConnector } from "./connectors/coinbase/coinbase-connector";
import { SUPPORTED_SYMBOLS } from "./config/symbols";

async function main() {
  console.log("[MarketDataService] starting...");

  const connectors = [
    new BinanceConnector(SUPPORTED_SYMBOLS),
    new CoinbaseConnector(SUPPORTED_SYMBOLS),
  ];

  // connect all exchanges
  connectors.forEach((c) => c.connect());
}

main();
