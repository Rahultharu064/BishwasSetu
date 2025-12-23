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

// Get providers by verification status
export const getProvidersByStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.query;

        if (!status) {
            return res.status(400).json({ message: "Status parameter is required" });
        }

        const validStatuses = ["INCOMPLETE", "DOCUMENTS_PENDING", "UNDER_REVIEW", "VERIFIED", "REJECTED"];
        if (!validStatuses.includes(status as string)) {
            return res.status(400).json({ message: "Invalid status parameter" });
        }

        const providers = await prismaClient.provider.findMany({
            where: {
                verificationStatus: status as any
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                        address: true,
                        district: true,
                        municipality: true
                    }
                },
                kycDocuments: true,
                category: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        res.json(providers);
    } catch (error) {
        console.error("Error fetching providers by status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Accept provider application
export const acceptProvider = async (req: Request, res: Response) => {
    try {
        const { providerId } = req.params;

        if (!providerId) {
            return res.status(400).json({ message: "Provider ID is required" });
        }

        const providerIdNum = parseInt(providerId);
        if (isNaN(providerIdNum)) {
            return res.status(400).json({ message: "Invalid provider ID" });
        }

        // Find the provider
        const provider = await prismaClient.provider.findUnique({
            where: { id: providerIdNum },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (!provider) {
            return res.status(404).json({ message: "Provider not found" });
        }

        if (provider.verificationStatus !== "UNDER_REVIEW") {
            return res.status(400).json({
                message: `Provider is already ${provider.verificationStatus.toLowerCase()}`
            });
        }

        // Update provider status to VERIFIED
        const updatedProvider = await prismaClient.provider.update({
            where: { id: providerIdNum },
            data: {
                verificationStatus: "VERIFIED",
                updatedAt: new Date()
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true
                    }
                },
                category: {
                    select: {
                        name: true
                    }
                }
            }
        });

        res.json({
            message: "Provider application accepted successfully",
            provider: updatedProvider
        });
    } catch (error) {
        console.error("Error accepting provider:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Reject provider application
export const rejectProvider = async (req: Request, res: Response) => {
    try {
        const { providerId } = req.params;
        const { reason } = req.body; // Optional rejection reason

        if (!providerId) {
            return res.status(400).json({ message: "Provider ID is required" });
        }

        const providerIdNum = parseInt(providerId);
        if (isNaN(providerIdNum)) {
            return res.status(400).json({ message: "Invalid provider ID" });
        }

        // Find the provider
        const provider = await prismaClient.provider.findUnique({
            where: { id: providerIdNum },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (!provider) {
            return res.status(404).json({ message: "Provider not found" });
        }

        if (provider.verificationStatus !== "UNDER_REVIEW") {
            return res.status(400).json({
                message: `Provider is already ${provider.verificationStatus.toLowerCase()}`
            });
        }

        // Update provider status to REJECTED
        const updatedProvider = await prismaClient.provider.update({
            where: { id: providerIdNum },
            data: {
                verificationStatus: "REJECTED",
                updatedAt: new Date()
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true
                    }
                },
                category: {
                    select: {
                        name: true
                    }
                }
            }
        });

        res.json({
            message: "Provider application rejected successfully",
            provider: updatedProvider,
            rejectionReason: reason || null
        });
    } catch (error) {
        console.error("Error rejecting provider:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get pending providers (UNDER_REVIEW status)
export const getPendingProviders = async (req: Request, res: Response) => {
    try {
        const providers = await prismaClient.provider.findMany({
            where: {
                verificationStatus: "UNDER_REVIEW"
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                        address: true,
                        district: true,
                        municipality: true
                    }
                },
                kycDocuments: true,
                category: {
                    select: {
                        name: true,
                        description: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        res.json({
            message: "Pending providers retrieved successfully",
            count: providers.length,
            providers
        });
    } catch (error) {
        console.error("Error fetching pending providers:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
