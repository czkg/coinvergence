import dotenv from "dotenv"
dotenv.config();
import express from "express"
import cors from "cors"

import { updateTopCryptos } from "./routes/crypto"
import cryptoRoutes from "./routes/crypto"
import authRoutes from "./routes/user"


const app = express();
app.use(cors());
app.use(express.json());

app.use(`/api/crypto`, cryptoRoutes);
app.use(`/api/auth`, authRoutes);

(async () => {
    try {
        console.log("Updating cryptos on server start...");
        await updateTopCryptos();
        console.log("Initial crypto prices updated.");
    } catch (error) {
        console.error("Error updating cryptos at startup:", error);
    }
})();

const UPDATE_INTERVAL = 5 * 60 * 1000;
setInterval(async () => {
    try {
        console.log("Scheduled crypto update started...");
        await updateTopCryptos();
        console.log("Crypto prices updated.");
    } catch (error) {
        console.error("Error updating cryptos:", error);
    }
}, UPDATE_INTERVAL);

//port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));