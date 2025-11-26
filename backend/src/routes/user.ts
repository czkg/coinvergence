import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import userDB from "../db/user_db"
import { authenticateToken } from "../middleware/authMiddleware"
import dotenv from "dotenv"
import prisma from "../prisma";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET!;
const backend_domain = process.env.BACKEND_DOMAIN;

//signup
router.post(`/signup`, async (req, res): Promise<any> => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        // check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // insert user data into database
        const newUser = await userDB.query(
            "INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING *",
            [firstName, lastName, email, hashedPassword]
        );

        // generate token to verify email address
        const token = jwt.sign({ userId: newUser.rows[0].id, email }, JWT_SECRET, { expiresIn: "1h" });

        // send response with the token and user object (without password)
        const { password_hash, ...userWithoutPassword } = newUser.rows[0]; 

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: userWithoutPassword, // Return user details excluding the password hash
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Registration failed" });
    }
});

//TODO:verification
// Node.js Express endpoint to verify the email token
// router.get("/activate", async (req, res): Promise<any> => {
//     const { token } = req.query;
  
//     try {
//       const decoded = jwt.verify(token as string, JWT_SECRET);  // verify the token
      
//       // Activate the user's account
//       const { email } = decoded as { email: string };
//       const updateUser = await userDB.query("UPDATE users SET verified = TRUE WHERE email = $1 RETURNING *", [email]);
      
//       if (updateUser.rows.length > 0) {
//         return res.redirect(`${backend_domain}/api/auth/verified?email=${email}`); // Redirect to frontend after verification
//       } else {
//         return res.status(400).json({ error: "Invalid token" });
//       }
//     } catch (error) {
//       return res.status(500).json({ error: "Error verifying email" });
//     }
// });

//signin
router.post(`/signin`, async (req, res): Promise<any> => {
    try {
        const { email, password } = req.body;
        const user = await userDB.query("SELECT * FROM users WHERE email = $1", [email]);

        if (user.rows.length === 0) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // Compare the hashed password
        const isValidPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!isValidPassword) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // Create JWT token
        const token = jwt.sign({ userId: user.rows[0].id, email }, JWT_SECRET, { expiresIn: "1h" });

        // Remove sensitive data (like password_hash) from the user object
        const { password_hash, ...userWithoutPassword } = user.rows[0]; 

        // Send response with the token and the user object (without password)
        res.json({ message: "login successful", token, user: userWithoutPassword });
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