import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import cryptoDB from "../../db/crypto_db"
import { authenticateToken } from "../middleware/authMiddleware"

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "czkg_coinvergence";


//register
router.post(`/register`, async (req, res): Promise<any> => {
    try {
        const { username, password } = req.body;

        const userExists = await cryptoDB.query("SELECT * FROM users WHERE username = $1", [username]);
        if(userExists.rows.length > 0) {
            return res.status(400).json({ error: "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await cryptoDB.query("INSERT INTO users (username, password) VALUES ($1, $2)", [username, hashedPassword]);
        res.json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Registration failed"});
    }
});

//log in
router.post(`/login`, async (req, res): Promise<any> => {
    try {
        const { username, password } = req.body;
        const user = await cryptoDB.query("SELECT * FROM users WHERE username = $1", [username]);
        if (user.rows.length === 0) {
            return res.status(400).json({ error: "Invalid credentials"});
        }

        const isValidPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!isValidPassword) {
            return res.status(400).json({ error: "Invalid credentials"});
        }

        const token = jwt.sign({ userId: user.rows[0].id, username }, JWT_SECRET, {expiresIn: "1h"});
        res.json({ message: "login successful", token });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ error: "Login failed" });
    }
});

//log out
router.post(`/logout`, (req, res) => {
    res.json({ message: "User logged out" });
});

export default router;