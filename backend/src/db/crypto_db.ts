import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

//crypto database connection
const crypto_DB = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    }
});

export default crypto_DB;
