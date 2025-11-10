import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// Use the same secret string that you use for signing JWTs
const SECRET = "my_secret_key";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload & { username?: string };
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1]; // Expecting "Bearer <token>"
    
    console.log("🟡 Full headers:", req.headers);
    console.log("🟢 Authorization header:", authHeader);
    console.log("🟠 Extracted token:", token);

    if (!token) {
      return res.status(401).json({ error: "Access denied. Token missing." });
    }

    // Verify the JWT with explicit algorithm and expiration max age
    const decoded = jwt.verify(token, SECRET, {
      algorithms: ["HS256"],
      maxAge: "1h",
    });

    if (typeof decoded === "string") {
      // Token payload should be an object, not a string
      return res.status(401).json({ error: "Invalid token payload." });
    }

    // Attach decoded payload (with username) to request
    req.user = decoded as JwtPayload & { username: string };

    if (!req.user.username) {
      return res.status(401).json({ error: "Unauthorized: username missing in token." });
    }

    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired." });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json({ error: "Invalid token." });
    }

    console.error("JWT verification error:", err);
    return res.status(500).json({ error: "Internal authentication error." });
  }
}
