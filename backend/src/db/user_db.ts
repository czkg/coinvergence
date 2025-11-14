import { Pool } from "pg"
import dotenv from "dotenv"

dotenv.config();

const userDB = new Pool({
    connectionString: process.env.DB_HOST,
});

export default userDB;