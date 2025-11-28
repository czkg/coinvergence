import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import userDB from "../db/user_db"
import { authenticateToken } from "../middleware/authMiddleware"
import dotenv from "dotenv"
import prisma from "../prisma";
import { AUTH_CONFIG } from "../config/authConfig";
import { sendVerificationEmail } from "../utils/sendEmail";
import { verify } from "crypto"

dotenv.config();

const router = express.Router();
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
}
const JWT_SECRET = process.env.JWT_SECRET;
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
            if (!existingUser.isVerified) {
                return res.status(400).json({ error: "User already exists but is not verified. Please check your email for the verification link." });
            }   
            return res.status(400).json({ 
                error: "User already exists",
                needsVerification: true,
            });
        }

        // hash the password
        const passHash = await bcrypt.hash(password, 10);

        // insert user data into database
        const newUser = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                passHash,
                isVerified: false,
            },
        });

        // generate datebase token
        const token = crypto.randomUUID();
        await prisma.emailVerificationToken.create({
          data: {
            token,
            userId: newUser.id,
            expiresAt: new Date(Date.now() + AUTH_CONFIG.verificationTokenExpiresIn),
          },
        });

        // send verification via SES
        await sendVerificationEmail(newUser.email, token); 

        return res.status(201).json({
            success: true,
            message: "User registered successfully. Please verify your email.",
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Registration failed" });
    }
});


// Node.js Express endpoint to verify the email token
router.get(`/verify-email`, async (req, res): Promise<any> => {
    try {
        const token = req.query.token as string;
        if (!token) {
            return res.status(400).json({ error: "Verification token is required" });
        }

        // look up token in database
        const record = await prisma.emailVerificationToken.findUnique({
          where: { token },
          include: { user: true },
        });

        if (!record) {
          return res.status(400).json({ error: "Invalid or expired verification link" });
        }

        // check if token is expired
        if (record.expiresAt < new Date()) {
          return res.status(400).json({ error: "Verification link has expired" });
        }

        // update user's isVerified status
        const updatedUser = await prisma.user.update({
            where: { id: record.userId },
            data: { isVerified: true },
        });

        await prisma.emailVerificationToken.delete({
          where: { token },
        });

        // Generate authentication JWT (auto-login)
        const jwtToken = jwt.sign({ id: updatedUser.id, email: updatedUser.email }, JWT_SECRET, { expiresIn: AUTH_CONFIG.jwtExpiresIn });

        return res.json({
            success: true,
            message: "Email verified successfully",
            token: jwtToken,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
            },
        });
        
    } catch (error) {
        console.error("VerifyEmail error:", error);
        return res.status(500).json({ error: "Server error" });
    }
});

//signin
router.post(`/signin`, async (req, res): Promise<any> => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(400).json({ error: "The email or password you entered is not correct" });
        }

        if (!user.isVerified) {
            return res.status(400).json({ error: "Please verify your email before signing in" });
        }

        // Compare the hashed password
        const isValidPassword = await bcrypt.compare(password, user.passHash);
        if (!isValidPassword) {
            return res.status(400).json({ error: "The email or password you entered is not correct" });
        }

        // Create JWT token
        const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: "1h" });

        // Remove sensitive data (like password_hash) from the user object
        const { passHash: _removed, ...safeUser } = user;  

        // Send response with the token and the user object (without password)
        res.json({ message: "login successful", token, user: safeUser });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ error: "Login failed" });
    }
});

// resend verification email
router.post("/resend-verification", async (req, res): Promise<any> => {
    try {
        const { email } = req.body;

        if (!email) {
        return res.status(400).json({ error: "Email is required" });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
        return res.status(400).json({ error: "User not found" });
        }

        if (user.isVerified) {
        return res.status(400).json({ error: "User is already verified" });
        }

        // Generate new token
        const token = crypto.randomUUID();

        // Delete any old tokens for this user
        await prisma.emailVerificationToken.deleteMany({
          where: { userId: user.id },
        });

        // Create new token (valid for 1 hour)
        await prisma.emailVerificationToken.create({
          data: {
            token,
            userId: user.id,
            expiresAt: new Date(Date.now() + AUTH_CONFIG.verificationTokenExpiresIn),
          },
        });

        // Send new email
        await sendVerificationEmail(email, token);

        return res.json({
          success: true,
          message: "Verification email has been resent",
        });

    } catch (error) {
        console.error("Resend verification error:", error);
        return res.status(500).json({
          error: "Server error while resending verification email",
        });
    }
});

//signout
router.post(`/signout`, (req, res) => {
    res.json({ message: "User logged out" });
});

export default router;