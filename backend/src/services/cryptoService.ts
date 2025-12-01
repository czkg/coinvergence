import axios from "axios";
import prisma from "../prisma";

// ===============
//  Update prices
// ===============
export async function updateTopCryptos() {
  try {
    console.log("[CryptoService] Fetching top cryptos...");

    const response = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: 100,
          page: 1,
          sparkline: false,
        },
      }
    );

    const cryptos = response.data;

    for (const crypto of cryptos) {
      const symbol = crypto.symbol.toUpperCase();

      // Upsert CryptoAsset
      const asset = await prisma.cryptoAsset.upsert({
        where: { symbol },
        update: {
          name: crypto.name,
          coinId: crypto.id,
          logoUrl: crypto.image,
        },
        create: {
          symbol,
          name: crypto.name,
          coinId: crypto.id,
          logoUrl: crypto.image,
        }
      });

      // Upsert CryptoPrice
      await prisma.cryptoPrice.upsert({
        where: { assetId: asset.id },
        update: {
          price: crypto.current_price,
          marketCap: crypto.market_cap,
          volume24h: crypto.total_volume,
          change24h: crypto.price_change_percentage_24h,
        },
        create: {
          assetId: asset.id,
          price: crypto.current_price,
          marketCap: crypto.market_cap,
          volume24h: crypto.total_volume,
          change24h: crypto.price_change_percentage_24h,
        }
      });
    }

    console.log("[CryptoService] Crypto prices updated.");
  } catch (err) {
    console.error("[CryptoService] Failed to update cryptos:", err);
  }
}


// =====================
//  Read prices for API
// =====================
export async function getCryptoPrices({ limit = 100, sort = "marketCap" }) {
  let orderBy: any;

  switch (sort) {
    case "price":
      orderBy = { price: "desc" as const };
      break;

    case "change24h":
      orderBy = { change24h: "desc" as const };
      break;

    case "symbol":
      orderBy = {
        asset: {
          symbol: "asc" as const
        }
      };
      break;

    case "marketCap":
    default:
      orderBy = { marketCap: "desc" as const };
      break;
  }

  const data = await prisma.cryptoPrice.findMany({
    take: limit,
    orderBy,
    include: {
      asset: true,
    },
  });

  return data.map((item) => ({
    symbol: item.asset.symbol,
    name: item.asset.name,
    logoUrl: item.asset.logoUrl,
    price: item.price,
    marketCap: item.marketCap,
    volume24h: item.volume24h,
    change24h: item.change24h,
    updatedAt: item.updatedAt,
  }));
}

