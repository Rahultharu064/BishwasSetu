import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
    id: number;
    role: "CUSTOMER" | "PROVIDER";
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    let token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        // Try to read httpOnly cookie named 'token' without cookie-parser
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
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

export const authorize = (roles: ("CUSTOMER" | "PROVIDER")[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    };
};
