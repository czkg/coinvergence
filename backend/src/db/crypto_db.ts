import { Pool } from "pg"
import dotenv from "dotenv"

dotenv.config();

const crypto_DB = new Pool({
    connectionString: process.env.DB_HOST,
});

export default crypto_DB;