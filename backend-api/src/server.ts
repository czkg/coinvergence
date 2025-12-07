import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import cryptoRoutes from "./routes/crypto";
import authRoutes from "./routes/auth";

// Load cron jobs (run automatically)
import "./cron/updateCryptos";
import "./cron/cleanup";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/crypto", cryptoRoutes);
app.use("/api/auth", authRoutes);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
