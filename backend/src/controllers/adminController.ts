import type { Request, Response } from "express";
import prismaClient from "../config/db.ts";

export const getAllProviders = async (req: Request, res: Response) => {
    try {
        const providers = await prismaClient.provider.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        res.json(providers);
    } catch (error) {
        console.error("Error fetching providers:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
