import type{ Request, Response, NextFunction } from "express";
import prismaClient from "../config/db.ts";

export const requireVerifiedProvider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const provider = await prismaClient.provider.findUnique({
      where: { userId: req.user.id }
    });

    if (!provider || provider.verificationStatus !== "VERIFIED") {
      return res.status(403).json({
        message: "Provider must be VERIFIED to perform this action"
      });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
