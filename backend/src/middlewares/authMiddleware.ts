import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express Request to include `user`
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

interface JwtPayload {
  id: number;
  role: "CUSTOMER" | "PROVIDER";
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  let token = req.header("Authorization")?.replace("Bearer ", "");

  // Fallback to cookie if Authorization header not present
  if (!token) {
    const cookieHeader = req.headers.cookie || "";
    const parts = cookieHeader.split(";").map((c) => c.trim());
    const tokenPair = parts.find((p) => p.startsWith("token="));
    if (tokenPair) token = tokenPair.substring("token=".length);
  }

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = decoded; // Attach payload to request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Role-based authorization middleware
export const authorize = (roles: JwtPayload["role"][]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
