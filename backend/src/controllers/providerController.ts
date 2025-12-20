import type { Request, Response } from "express";
import prismaClient from "../config/db.ts";

// Complete Provider Profile
export const completeProviderProfile = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });
        const { legalName, experienceYears, bio, serviceArea, availability } = req.body;

        const provider = await prismaClient.provider.update({
            where: { userId: req.user.id },
            data: {
                legalName,
                experienceYears,
                bio,
                serviceArea,
                availability,
                verificationStatus: "DOCUMENTS_PENDING"
            }
        });

        res.json({ message: "Profile completed. Upload KYC documents.", provider });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Upload Profile Photo
export const uploadProfilePhoto = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const filePath = `/uploads/images/${req.file.filename}`;

    await prismaClient.provider.update({
        where: { userId: req.user.id },
        data: { profilePhotoUrl: filePath }
    });

    res.json({ message: "Profile photo uploaded", profilePhotoUrl: filePath });
};

// Upload KYC
export const uploadKyc = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { type } = req.body;
    if (!req.file) return res.status(400).json({ message: "File required" });

    const provider = await prismaClient.provider.findUnique({ where: { userId: req.user.id } });

    if (!provider) return res.status(404).json({ message: "Provider not found" });

    const kyc = await prismaClient.kYCDocument.create({
        data: {
            providerId: provider.id,
            type,
            fileUrl: `/uploads/${req.file.filename}`
        }
    });

    res.status(201).json({ message: "KYC uploaded successfully", kyc });
};

// Get KYC Status
export const getKycStatus = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Authentication required" });

        const provider = await prismaClient.provider.findUnique({
            where: { userId: req.user.id },
            include: { kycDocuments: true }
        });

        // Check if provider exists
        if (!provider) {
            return res.status(404).json({ message: "Provider not found" });
        }

        res.json({
            verificationStatus: provider.verificationStatus,
            documents: provider.kycDocuments
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Public Provider Profile
export const getProviderById = async (req: Request, res: Response) => {
    const provider = await prismaClient.provider.findUnique({
        where: { id: parseInt(req.params.id) },
        include: { user: { select: { name: true, email: true } }, kycDocuments: true }
    });

    if (!provider) return res.status(404).json({ message: "Provider not found" });

    res.json(provider);
};
