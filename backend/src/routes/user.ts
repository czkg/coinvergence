import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"
import userDB from "../../db/user_db"
import { authenticateToken } from "../middleware/authMiddleware"
import dotenv from "dotenv"

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "czkg_coinvergence";
const backend_domain = process.env.BACKEND_DOMAIN;

//set up nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

//signup
router.post(`/signup`, async (req, res): Promise<any> => {
    try {
        const { firstName, lastName, email, password } = req.body;

        //check if user already exists
        const existingUser = await userDB.query("SELECT * FROM users WHERE email = $1", [email]);
        if(existingUser.rows.length > 0) {
            return res.status(400).json({ error: "User already exists"});
        }

        //hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        //insert user data into database
        const newUser = await userDB.query(
            "INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING *", 
            [firstName, lastName, email, hashedPassword]
        );

        //generate token to verify email address
        const token = jwt.sign({ userId: newUser.rows[0].id }, JWT_SECRET, { expiresIn: "1h" });

        //send verification email
        const verificationLink = `${backend_domain}/api/auth/activate?token=${token}`;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Activate Your Account",
            text: `Click the link below to activate your account:\n\n${verificationLink}`,
        });

        res.status(201).json({ message: "User registered successfully", user: newUser.rows[0] });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Registration failed"});
    }
});

// Node.js Express endpoint to verify the email token
router.get("/activate", async (req, res): Promise<any> => {
    const { token } = req.query;
  
    try {
      const decoded = jwt.verify(token as string, JWT_SECRET);  // verify the token
      
      // Activate the user's account
      const { email } = decoded as { email: string };
      const updateUser = await userDB.query("UPDATE users SET verified = TRUE WHERE email = $1 RETURNING *", [email]);
      
      if (updateUser.rows.length > 0) {
        return res.redirect(`${backend_domain}/api/auth/verified?email=${email}`); // Redirect to frontend after verification
      } else {
        return res.status(400).json({ error: "Invalid token" });
      }
    } catch (error) {
      return res.status(500).json({ error: "Error verifying email" });
    }
});
  

//signin
router.post(`/signin`, async (req, res): Promise<any> => {
    try {
        const { email, password } = req.body;
        const user = await userDB.query("SELECT * FROM users WHERE username = $1", [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ error: "Invalid credentials"});
        }

        //hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const isValidPassword = await bcrypt.compare(hashedPassword, user.rows[0].password_hash);
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