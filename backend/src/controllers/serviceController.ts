import type { Request, Response } from "express";
import prismaClient from "../config/db.ts";

export const createService = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      console.log("CreateService: No user in request");
      return res.status(401).json({ message: "Unauthorized" });
    }
    console.log(`CreateService: User ${req.user.id} Role ${req.user.role} Payload:`, req.body);

    const { categoryId, title, description, icon, providerId } = req.body;

    let provider;

    // If admin is creating service for a specific provider
    if (req.user.role === "ADMIN" && providerId) {
      provider = await prismaClient.provider.findUnique({
        where: { id: providerId },
      });

      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }

      if (provider.verificationStatus !== "VERIFIED") {
        console.log(`CreateService: [ADMIN] Provider ${provider.id} is not VERIFIED (Status: ${provider.verificationStatus})`);
        return res.status(403).json({ message: "Provider must be verified to create services" });
      }
    } else {
      // For providers or admin creating their own service
      provider = await prismaClient.provider.findUnique({
        where: { userId: req.user.id },
      });

      // If admin, ensure they have a verified provider profile
      if (req.user.role === "ADMIN") {
        if (!provider) {
          // Get first category as default
          const defaultCategory = await prismaClient.category.findFirst();
          if (!defaultCategory) {
            console.log("CreateService: [ADMIN] No default category found");
            return res.status(500).json({ message: "No categories available" });
          }

          provider = await prismaClient.provider.create({
            data: {
              userId: req.user.id,
              categoryId: defaultCategory.id,
              legalName: "Administrator Services",
              bio: "Administrative service profile",
              experienceYears: 0,
              price: 0,
              duration: "Per Service",
              verificationStatus: "VERIFIED",
              updatedAt: new Date()
            }
          });
        } else if (provider.verificationStatus !== "VERIFIED") {
          provider = await prismaClient.provider.update({
            where: { id: provider.id },
            data: { verificationStatus: "VERIFIED" }
          });
        }
      }

      if (!provider) {
        return res.status(404).json({ message: "Provider not found" });
      }

      if (provider.verificationStatus !== "VERIFIED") {
        console.log(`CreateService: [PROVIDER] Provider ${provider.id} is not VERIFIED (Status: ${provider.verificationStatus})`);
        return res.status(403).json({ message: "Provider must be verified to create services" });
      }
    }

    // Check if category exists
    const category = await prismaClient.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const service = await prismaClient.service.create({
      data: {
        providerId: provider.id,
        categoryId,
        title,
        description,
        icon,
        updatedAt: new Date()
      },
      include: {
        category: true,
        provider: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    res.status(201).json({ message: "Service created successfully", service });
  } catch (error) {
    console.error(error);
    
  }
};

export const getServicesByProvider = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const provider = await prismaClient.provider.findUnique({
      where: { userId: req.user.id },
    });

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const services = await prismaClient.service.findMany({
      where: { providerId: provider.id },
      include: {
        category: true,
        provider: true
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ message: "Service ID is required" });
    }

    const provider = await prismaClient.provider.findUnique({
      where: { userId: req.user.id },
    });

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const service = await prismaClient.service.findUnique({
      where: { id: parseInt(id) },
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (service.providerId !== provider.id) {
      return res.status(403).json({ message: "Unauthorized to update this service" });
    }

    const updatedService = await prismaClient.service.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        category: true,
        provider: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    res.json({ message: "Service updated successfully", service: updatedService });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Service ID is required" });
    }

    const service = await prismaClient.service.findUnique({
      where: { id: parseInt(id) },
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Allow deletion if user is ADMIN or the OWNER (Provider)
    if (req.user.role !== "ADMIN") {
      const provider = await prismaClient.provider.findUnique({
        where: { userId: req.user.id },
      });

      if (!provider || service.providerId !== provider.id) {
        return res.status(403).json({ message: "Unauthorized to delete this service" });
      }
    }

    await prismaClient.service.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getServicesByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      return res.status(400).json({ message: "Category ID is required" });
    }

    const services = await prismaClient.service.findMany({
      where: { categoryId },
      include: {
        category: true,
        provider: {
          include: {
            user: { select: { name: true } },
            kycDocuments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllServices = async (req: Request, res: Response) => {
  try {
    const services = await prismaClient.service.findMany({
      include: {
        category: true,
        provider: {
          include: {
            user: { select: { name: true } },
            kycDocuments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get services with advanced filtering
export const getServicesWithFilters = async (req: Request, res: Response) => {
  try {
    const {
      search = "",
      category = "",
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      page = "1",
      limit = "20",
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      provider: {
        verificationStatus: "VERIFIED",
      },
    };

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ];
    }

    // Category filter
    if (category && category !== "All") {
      where.category = {
        name: category as string,
      };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.provider = { ...where.provider, price: {} };
      if (minPrice) where.provider.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.provider.price.lte = parseFloat(maxPrice as string);
    }

    // Determine sort order
    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "price_asc") orderBy = { provider: { price: "asc" } };
    if (sortBy === "price_desc") orderBy = { provider: { price: "desc" } };
    if (sortBy === "title") orderBy = { title: "asc" };

    const [services, total] = await Promise.all([
      prismaClient.service.findMany({
        where,
        include: {
          category: true,
          provider: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prismaClient.service.count({ where }),
    ]);

    res.json({
      services,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get service statistics (aggregated by title) for the Services page
export const getServiceStats = async (req: Request, res: Response) => {
  try {
    const services = await prismaClient.service.findMany({
      where: {
        provider: {
          verificationStatus: "VERIFIED",
        },
      },
      include: {
        category: true,
      },
    });

    // Grouping by title to match frontend "Service Type" view
    const grouped = services.reduce((acc: any, service: any) => {
      const title = service.title;
      if (!acc[title]) {
        acc[title] = {
          id: service.id,
          name: title,
          icon: service.icon || "🔧",
          providers: 0,
          rating: 4.8, // Placeholder: average rating from reviews can be added here
          category: service.category.name,
        };
      }
      acc[title].providers += 1;
      return acc;
    }, {});

    const stats = Object.values(grouped);
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Get single service by ID
export const getServiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Service ID is required" });
    }

    const service = await prismaClient.service.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        provider: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
                address: true,
              },
            },
            kycDocuments: true,
          },
        },
      },
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
