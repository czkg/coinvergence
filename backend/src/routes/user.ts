import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { authenticateToken } from "../middleware/authMiddleware"
import dotenv from "dotenv"
import prisma from "../prisma";

dotenv.config();

// const router = express.Router();
// if (!process.env.JWT_SECRET) {
//     throw new Error("JWT_SECRET is not set");
// }
// const JWT_SECRET = process.env.JWT_SECRET;
// const backend_domain = process.env.BACKEND_DOMAIN;

// //signup
// router.post(`/signup`, async (req, res): Promise<any> => {
//     try {
//         const { firstName, lastName, email, password } = req.body;

//         // basic email format validation
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(email)) {
//             return res.status(400).json({ error: "Invalid email format" });
//         }

//         // check if user already exists
//         const existingUser = await prisma.user.findUnique({
//             where: { email },
//         });
//         if (existingUser) {
//             return res.status(400).json({ error: "User already exists" });
//         }

//         // hash the password
//         const passHash = await bcrypt.hash(password, 10);

//         // insert user data into database
//         const newUser = await prisma.user.create({
//             data: {
//                 firstName,
//                 lastName,
//                 email,
//                 passHash,
//                 isVerified: false,
//             },
//         });

//         // generate token to verify email address
//         const verifyToken = jwt.sign({ userId: newUser.id, email }, JWT_SECRET, { expiresIn: "1h" });
//         const verifyUrl = `${backend_domain}/verify-email?token=${verifyToken}`;

//         // send response with the token and user object (without password)
//         const { passHash: _removed, ...safeUser } = newUser; 

//         return res.status(201).json({
//             message: "User registered successfully. Please verify your email.",
//             verifyUrl,
//             user: safeUser, // Return user details excluding the password hash
//         });
//     } catch (error) {
//         console.error("Error registering user:", error);
//         res.status(500).json({ error: "Registration failed" });
//     }
// });


// // Node.js Express endpoint to verify the email token
// router.get("/verify", async (req, res): Promise<any> => {
//     try {
//         const token = req.query.token as string;
//         if (!token) {
//             return res.status(400).json({ error: "Verification token is required" });
//         }

//         let payload;
//         try {
//             payload = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
//         } catch (err) {
//             return res.status(400).json({ error: "Invalid or expired token" });
//         }

//         // chekc user existence
//         const user = await prisma.user.findUnique({
//             where: { id: payload.userId },
//         });
//         if (!user) {
//             return res.status(400).json({ error: "User not found" });
//         }

//         // update user's isVerified status
//         await prisma.user.update({
//             where: { id: payload.userId },
//             data: { isVerified: true },
//         });

//         res.json({ message: "Email verified successfully" });
//     } catch (error) {
//         console.error("VerifyEmail error:", error);
//         return res.status(500).json({ error: "Server error" });
//     }
// });

// //signin
// router.post(`/signin`, async (req, res): Promise<any> => {
//     try {
//         const { email, password } = req.body;
//         const user = await userDB.query("SELECT * FROM users WHERE email = $1", [email]);

//         if (user.rows.length === 0) {
//             return res.status(400).json({ error: "Invalid credentials" });
//         }

//         // Compare the hashed password
//         const isValidPassword = await bcrypt.compare(password, user.rows[0].password_hash);
//         if (!isValidPassword) {
//             return res.status(400).json({ error: "Invalid credentials" });
//         }

//         // Create JWT token
//         const token = jwt.sign({ userId: user.rows[0].id, email }, JWT_SECRET, { expiresIn: "1h" });

//         // Remove sensitive data (like password_hash) from the user object
//         const { password_hash, ...userWithoutPassword } = user.rows[0]; 

//         // Send response with the token and the user object (without password)
//         res.json({ message: "login successful", token, user: userWithoutPassword });
//     } catch (error) {
//         console.error("Error logging in:", error);
//         res.status(500).json({ error: "Login failed" });
//     }
// });


// //signout
// router.post(`/signout`, (req, res) => {
//     res.json({ message: "User logged out" });
// });

// export default router;