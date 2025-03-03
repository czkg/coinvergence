import express from "express"
import axios from "axios"
import cors from "cors"
import cryptoDB from "../../db/crypto_db"
import dotenv from "dotenv";

dotenv.config();

//update top cryptos
export const updateTopCryptos = async () => {
    try {
        const response = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
            params: {
                vs_currency: "usd",
                order: "market_cap_desc", //volume_desc
                per_page: 100,
                page: 1,
                sparkline: false,
            },
        });

        const cryptos = response.data;

        for(const crypto of cryptos) {
            const symbol = crypto.symbol.toUpperCase();
            const price = crypto.current_price;

            await cryptoDB.query(
                `INSERT INTO crypto_prices (symbol, price, updated_at)
                 VALUES ($1, $2, NOW())
                 ON CONFLICT (symbol) DO UPDATE SET price = EXCLUDED.price, updated_at = NOW()`,
                [symbol, price]
              );              
        }
        console.log("Top 100 cryptos updated.")
    } catch (error) {
        console.error("Error updating top cryptos:", error);
    }
};

//home_trending_cap
const router = express.Router();
router.get(`/trending_cap`, async (req, res): Promise<any> => {
    try {
        const limit = parseInt(req.query.limit as string) || 100;
        await updateTopCryptos();
        const result = await cryptoDB.query(
            "SELECT symbol, price FROM crypto_prices ORDER BY price DESC LIMIT $1",
            [limit]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({error: "No crypto data available"});
        }
        const formattedData = result.rows.map(row => ({
            symbol: row.symbol,
            price: parseFloat(row.price).toFixed(2),
        }));
        res.json(formattedData);
    } catch (error) {
        console.error("Error fetching top crypto:", error);
        res.status(500).json({error: "Failed to fetch top crypto"});
    }
});

export default router;
//home_trending_volume



