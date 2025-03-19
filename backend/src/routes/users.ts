import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import cryptoDB from "../../db/crypto_db"
import { authenticateToken } from "../middleware/authMiddleware"

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "czkg_coinvergence";


//signup
router.post(`/signup`, async (req, res): Promise<any> => {
    try {
        const { firstName, lastName, email, password } = req.body;

        //check if user already exists
        const existingUser = await cryptoDB.query("SELECT * FROM users WHERE email = $1", [email]);
        if(existingUser.rows.length > 0) {
            return res.status(400).json({ error: "User already exists"});
        }

        //hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        //insert user data into database
        const newUser = await cryptoDB.query(
            "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *", 
            [firstName, lastName, email, hashedPassword]
        );
        res.status(201).json({ message: "User registered successfully", user: newUser.rows[0] });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Registration failed"});
    }
});

//signin
router.post(`/signin`, async (req, res): Promise<any> => {
    try {
        const { email, password } = req.body;
        const user = await cryptoDB.query("SELECT * FROM users WHERE username = $1", [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ error: "Invalid credentials"});
        }

        const isValidPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!isValidPassword) {
            return res.status(400).json({ error: "Invalid credentials"});
        }

        const token = jwt.sign({ userId: user.rows[0].id, email }, JWT_SECRET, {expiresIn: "1h"});
        res.json({ message: "login successful", token });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ error: "Login failed" });
    }
});

//signout
router.post(`/signout`, (req, res) => {
    res.json({ message: "User logged out" });
});

export default router;