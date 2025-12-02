import { Router } from "express";
import prisma from "../prisma";

const router = Router();

/**
 * GET /api/crypto/prices
 * Return cryptos sorted by price DESC (your trending_cap logic)
 */
router.get("/prices", async (req, res): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 100;

    const data = await prisma.cryptoPrice.findMany({
      take: limit,
      orderBy: { price: "desc" },      
      include: { asset: true },
    });

    if (data.length === 0) {
      res.status(404).json({ error: "No crypto data available" });
      return;
    }

    const formatted = data.map((row) => ({
      symbol: row.asset.symbol,
      name: row.asset.name,
      logoUrl: row.asset.logoUrl,
      price: Number(row.price),
      marketCap: row.marketCap,
      volume24h: row.volume24h,
      change24h: row.change24h,
      updatedAt: row.updatedAt,
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });

  } catch (err) {
    console.error("Error fetching /prices:", err);
    res.status(500).json({ error: "Failed to fetch crypto prices" });
  }
});

export default router;
