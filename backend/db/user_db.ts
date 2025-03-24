import { Pool } from "pg"
import dotenv from "dotenv"

dotenv.config();

const userDB = new Pool({
    connectionString: process.env.USER_DATABASE_URL,
});

export default userDB;