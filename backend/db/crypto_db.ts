import { Pool} from "pg"
import dotenv from "dotenv"

dotenv.config();

const crypto_DB = new Pool({
    connectionString: process.env.CRYPTO_DATABASE_URL,
});

export default crypto_DB;