import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: number;
  firstName: string;
  lastName: string
  email: string;
  iat: number;
  exp: number;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): any => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  // “Bearer <token>”
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "Invalid Authorization header format" });
  }

  const token = parts[1];

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("ERROR: JWT_SECRET missing in environment");
    return res.status(500).json({ error: "Server misconfigured" });
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    (req as any).user = {
      userId: decoded.userId,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      email: decoded.email
    };

    return next();
  } catch (error: any) {
    console.error("JWT error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }

    return res.status(500).json({ error: "Token verification failed" });
  }
};
