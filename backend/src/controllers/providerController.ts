import type { Request, Response } from "express";
import prismaClient from "../config/db.ts";

// Become a Provider (First-time registration)
export const becomeProvider = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });

        // Parse form data (FormData sends everything as strings)
        const {
            gender, address, district, municipality,
            categoryId,
            legalName, experienceYears, bio, skills,
            prevCompany, prevRole, workDuration,
            serviceDistrict, serviceMunicipality,
            availabilityDays, availabilityTime,
            isEmergencyAvailable, emergencyResponseTime, emergencyExtraCharge,

            price, duration
        } = req.body;

        console.log("BecomeProvider Request Body:", JSON.stringify(req.body, null, 2));

        // Extract files

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        // Check if user is already a provider
        const existingProvider = await prismaClient.provider.findUnique({
            where: { userId: req.user.id }
        });

        if (existingProvider) {
            console.log("Validation Failed: Provider already exists for user", req.user.id);
            return res.status(400).json({ message: "You are already a provider." });
        }

        // Validate required fields
        if (!legalName || !bio) {
            console.log("Validation Failed: Missing legalName or bio");
            return res.status(400).json({
                message: "Legal name and bio are required fields."
            });
        }



        // Validate required files
        console.log("Files received:", req.files ? Object.keys(req.files) : "No files");
        if (!files?.govtIdFront?.[0] || !files?.govtIdBack?.[0]) {
            console.log("Validation Failed: Missing ID files");
            return res.status(400).json({
                message: "Both front and back sides of government ID are required."
            });
        }

        // Generate file URLs
        const profilePhotoUrl = files?.photo?.[0] ?
            `/uploads/images/profile-photos/${files.photo[0].filename}` : null;

        const tradeLicenseUrl = files?.tradeLicense?.[0] ?
            (files.tradeLicense[0].mimetype === 'application/pdf'
                ? `/uploads/docs/${files.tradeLicense[0].filename}`
                : `/uploads/kyc/certificates/${files.tradeLicense[0].filename}`)
            : null;

        // Handle portfolio images
        const portfolioImageUrls: string[] = [];
        if (files?.portfolioImages) {
            files.portfolioImages.forEach((file: Express.Multer.File) => {
                portfolioImageUrls.push(`/uploads/images/portfolio/${file.filename}`);
            });
        }

        // Transaction to create provider and update user
        const provider = await prismaClient.$transaction(async (prisma) => {
            // Create provider
            const newProvider = await prisma.provider.create({
                data: {
                    userId: req.user!.id,
                    categoryId: categoryId || null,
                    legalName,
                    experienceYears: experienceYears ? parseInt(experienceYears.toString()) : 0,
                    bio,
                    skills: skills || null,
                    prevCompany: prevCompany || null,
                    prevRole: prevRole || null,
                    workDuration: workDuration || null,
                    portfolioUrls: portfolioImageUrls.length > 0 ? portfolioImageUrls.join(',') : null,
                    tradeLicenseUrl,
                    profilePhotoUrl,
                    serviceDistrict: serviceDistrict || district || null,
                    serviceMunicipality: serviceMunicipality || municipality || null,
                    availabilityDays: availabilityDays || null,
                    availabilityTime: availabilityTime || "09:00 - 17:00",
                    isEmergencyAvailable: isEmergencyAvailable === "true" || isEmergencyAvailable === true,
                    emergencyResponseTime: emergencyResponseTime || "1h",
                    emergencyExtraCharge: (emergencyExtraCharge !== undefined &&
                        emergencyExtraCharge !== null &&
                        emergencyExtraCharge !== "")
                        ? parseFloat(emergencyExtraCharge.toString())
                        : null,
                    price: (price !== undefined &&
                        price !== null &&
                        price !== "")
                        ? parseFloat(price.toString())
                        : null,
                    duration: duration || "Per Hour",
                    verificationStatus: "UNDER_REVIEW",
                    updatedAt: new Date()
                }
            });

            // Create KYC Documents
            if (files?.govtIdFront?.[0]) {
                await prisma.kycdocument.create({
                    data: {
                        providerId: newProvider.id,
                        type: "GOVERNMENT_ID",
                        fileUrl: `/uploads/kyc/government-id/${files.govtIdFront[0].filename}`,

                    }
                });
            }

            if (files?.govtIdBack?.[0]) {
                await prisma.kycdocument.create({
                    data: {
                        providerId: newProvider.id,
                        type: "GOVERNMENT_ID",
                        fileUrl: `/uploads/kyc/government-id/${files.govtIdBack[0].filename}`,

                    }
                });
            }

            // Update user role and information
            await prisma.user.update({
                where: { id: req.user!.id },
                data: {
                    role: "PROVIDER",
                    ...(address && { address }),
                    ...(district && { district }),
                    ...(municipality && { municipality }),
                    ...(gender && { gender })
                }
            });

            return newProvider;
        });

        res.status(201).json({
            message: "Provider profile created successfully!",
            provider
        });
    } catch (error) {
        console.error("Become provider error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Complete Provider Profile (Update existing provider)
export const completeProviderProfile = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });

        // Check if provider profile exists
        const existingProvider = await prismaClient.provider.findUnique({
            where: { userId: req.user.id }
        });

        if (!existingProvider) {
            return res.status(400).json({
                message: "Provider profile not found. Please initiate provider registration first."
            });
        }

        // Parse form data
        const {
            gender, address, district, municipality,
            categoryId,
            legalName, experienceYears, bio, skills,
            prevCompany, prevRole, workDuration,
            serviceDistrict, serviceMunicipality,
            availabilityDays, availabilityTime,
            isEmergencyAvailable, emergencyResponseTime, emergencyExtraCharge,
            price, duration,
            verificationStatus
        } = req.body;

        // Extract files
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        // Generate file URLs for new uploads
        const profilePhotoUrl = files?.photo?.[0] ?
            `/uploads/images/profile-photos/${files.photo[0].filename}` : undefined;

        const tradeLicenseUrl = files?.tradeLicense?.[0] ?
            (files.tradeLicense[0].mimetype === 'application/pdf'
                ? `/uploads/docs/${files.tradeLicense[0].filename}`
                : `/uploads/kyc/certificates/${files.tradeLicense[0].filename}`)
            : undefined;

        // Handle portfolio images
        const portfolioImageUrls: string[] = [];
        if (files?.portfolioImages) {
            files.portfolioImages.forEach((file: Express.Multer.File) => {
                portfolioImageUrls.push(`/uploads/images/portfolio/${file.filename}`);
            });
        }

        const provider = await prismaClient.$transaction(async (prisma) => {
            // Prepare provider update data
            const providerUpdateData: any = {};
            const userUpdateData: any = {};

            // Provider fields
            if (legalName !== undefined) providerUpdateData.legalName = legalName;
            if (categoryId !== undefined) providerUpdateData.categoryId = categoryId || null;
            if (bio !== undefined) providerUpdateData.bio = bio;
            if (skills !== undefined) providerUpdateData.skills = skills;
            if (prevCompany !== undefined) providerUpdateData.prevCompany = prevCompany;
            if (prevRole !== undefined) providerUpdateData.prevRole = prevRole;
            if (workDuration !== undefined) providerUpdateData.workDuration = workDuration;
            if (serviceDistrict !== undefined) providerUpdateData.serviceDistrict = serviceDistrict;
            if (serviceMunicipality !== undefined) providerUpdateData.serviceMunicipality = serviceMunicipality;
            if (availabilityDays !== undefined) providerUpdateData.availabilityDays = availabilityDays;
            if (availabilityTime !== undefined) providerUpdateData.availabilityTime = availabilityTime;
            if (duration !== undefined) providerUpdateData.duration = duration;
            if (verificationStatus !== undefined) providerUpdateData.verificationStatus = verificationStatus;

            if (isEmergencyAvailable !== undefined) {
                providerUpdateData.isEmergencyAvailable =
                    isEmergencyAvailable === "true" || isEmergencyAvailable === true;
            }

            if (emergencyResponseTime !== undefined) {
                providerUpdateData.emergencyResponseTime = emergencyResponseTime;
            }

            if (emergencyExtraCharge !== undefined && emergencyExtraCharge !== null && emergencyExtraCharge !== "") {
                providerUpdateData.emergencyExtraCharge = parseFloat(emergencyExtraCharge.toString());
            }

            if (price !== undefined && price !== null && price !== "") {
                providerUpdateData.price = parseFloat(price.toString());
            }

            if (experienceYears !== undefined) {
                providerUpdateData.experienceYears = parseInt(experienceYears.toString());
            }

            if (profilePhotoUrl) providerUpdateData.profilePhotoUrl = profilePhotoUrl;
            if (tradeLicenseUrl) providerUpdateData.tradeLicenseUrl = tradeLicenseUrl;

            if (portfolioImageUrls.length > 0) {
                // Merge with existing portfolio URLs if any
                const existingPortfolio = existingProvider.portfolioUrls ?
                    existingProvider.portfolioUrls.split(',') : [];
                const allPortfolio = [...existingPortfolio, ...portfolioImageUrls];
                providerUpdateData.portfolioUrls = allPortfolio.join(',');
            }

            // User fields
            if (address !== undefined) userUpdateData.address = address;
            if (district !== undefined) userUpdateData.district = district;
            if (municipality !== undefined) userUpdateData.municipality = municipality;
            if (gender !== undefined) userUpdateData.gender = gender;

            // Update provider
            const updatedProvider = await prisma.provider.update({
                where: { userId: req.user!.id },
                data: providerUpdateData
            });

            // Handle KYC Documents (only if new files uploaded)
            if (files?.govtIdFront?.[0]) {
                await prisma.kycdocument.create({
                    data: {
                        providerId: updatedProvider.id,
                        type: "GOVERNMENT_ID",
                        fileUrl: `/uploads/kyc/government-id/${files.govtIdFront[0].filename}`,

                    }
                });
            }

            if (files?.govtIdBack?.[0]) {
                await prisma.kycdocument.create({
                    data: {
                        providerId: updatedProvider.id,
                        type: "GOVERNMENT_ID",
                        fileUrl: `/uploads/kyc/government-id/${files.govtIdBack[0].filename}`,

                    }
                });
            }

            // Update user if there are changes
            if (Object.keys(userUpdateData).length > 0) {
                await prisma.user.update({
                    where: { id: req.user!.id },
                    data: userUpdateData
                });
            }

            return updatedProvider;
        });

        res.json({
            message: "Profile updated successfully!",
            provider
        });
    } catch (error) {
        console.error("Complete profile error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Upload Profile Photo (Separate endpoint)
export const uploadProfilePhoto = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const provider = await prismaClient.provider.findUnique({
            where: { userId: req.user.id }
        });

        if (!provider) return res.status(404).json({ message: "Provider not found" });

        const filePath = `/uploads/images/profile-photos/${req.file.filename}`;

        await prismaClient.provider.update({
            where: { userId: req.user.id },
            data: { profilePhotoUrl: filePath }
        });

        res.json({
            message: "Profile photo uploaded successfully",
            profilePhotoUrl: filePath
        });
    } catch (error) {
        console.error("Upload profile photo error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Upload KYC Document
export const uploadKyc = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });

        const { type } = req.body;
        if (!req.file) return res.status(400).json({ message: "File required" });

        const provider = await prismaClient.provider.findUnique({
            where: { userId: req.user.id }
        });

        if (!provider) return res.status(404).json({ message: "Provider not found" });

        // Determine file path based on type
        let filePath = "";
        if (type === "GOVERNMENT_ID") {
            filePath = `/uploads/kyc/government-id/${req.file.filename}`;
        } else if (type === "CERTIFICATE") {
            filePath = req.file.mimetype === 'application/pdf'
                ? `/uploads/docs/${req.file.filename}`
                : `/uploads/kyc/certificates/${req.file.filename}`;
        } else if (type === "PROFILE_PHOTO") {
            filePath = `/uploads/images/profile-photos/${req.file.filename}`;
        } else {
            filePath = `/uploads/${req.file.filename}`;
        }

        const kyc = await prismaClient.kycdocument.create({
            data: {
                providerId: provider.id,
                type,
                fileUrl: filePath
            }
        });

        res.status(201).json({
            message: "KYC document uploaded successfully",
            kyc
        });
    } catch (error) {
        console.error("Upload KYC error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get KYC Status
export const getKycStatus = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Authentication required" });

        const provider = await prismaClient.provider.findUnique({
            where: { userId: req.user.id },
            include: {
                kycDocuments: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });

        // Check if provider exists
        if (!provider) {
            return res.status(404).json({ message: "Provider not found" });
        }

        res.json({
            verificationStatus: provider.verificationStatus,
            documents: provider.kycDocuments,
            providerInfo: {
                legalName: provider.legalName,
                profilePhotoUrl: provider.profilePhotoUrl,
                user: provider.user
            }
        });
    } catch (error) {
        console.error("Get KYC status error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get Public Provider Profile
export const getProviderById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id || "");
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid Provider ID" });
        }

        const provider = await prismaClient.provider.findUnique({
            where: { id },
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
            }
        });

        if (!provider) return res.status(404).json({ message: "Provider not found" });

        // Don't expose sensitive KYC documents in public endpoint
        const { kycDocuments, ...providerData } = provider;

        res.json({
            ...providerData,
            verificationStatus: provider.verificationStatus
        });
    } catch (error) {
        console.error("Get provider by ID error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Optional: Get current provider's full profile
export const getMyProviderProfile = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });

        const provider = await prismaClient.provider.findUnique({
            where: { userId: req.user.id },
            include: {
                user: true,
                kycDocuments: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                        description: true
                    }
                }
            }
        });

        if (!provider) {
            return res.status(404).json({ message: "Provider profile not found" });
        }

        res.json(provider);
    } catch (error) {
        console.error("Get my provider profile error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
