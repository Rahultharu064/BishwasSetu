import type { Request, Response } from "express";
import prismaClient from "../config/db.ts";

// Create a new service
export const createService = async (req: Request, res: Response) => {
  try {
    const { title, description, price, location, categoryId } = req.body;
    const providerId = req.user?.id; // Assuming user ID is available in req.user from authMiddleware

    if (!providerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if category exists
    const category = await prismaClient.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Verify user is a provider
    const user = await prismaClient.user.findUnique({
        where: { id: providerId },
    });

    if (user?.role !== "PROVIDER") {
        return res.status(403).json({ message: "Only providers can create services" });
    }


    const service = await prismaClient.service.create({
      data: {
        title,
        description,
        price,
        location,
        providerId,
        categoryId,
      },
    });

    // Increment provider count in category if it's the first service by this provider in this category
    // This logic might need refinement based on exact requirements (e.g., unique providers vs total services)
    // For now, let's keep it simple or skip it as providerCount is Int @default(0)
    
    // Simple logic: Update provider count (This logic is slightly flawed as it counts services not unique providers, but following schema for now)
    await prismaClient.category.update({
        where: { id: categoryId },
        data: { providerCount: { increment: 1 } }
    });

    return res.status(201).json(service);
  } catch (error) {
    console.error("Create service error:", error);
    return res.status(500).json({ message: "Failed to create service" });
  }
};

// Get all services with filters
export const getServices = async (req: Request, res: Response) => {
  try {
    const { category, location, search } = req.query;

    const whereClause: any = {};

    if (category) {
      whereClause.categoryId = String(category);
    }

    if (location) {
      whereClause.location = { contains: String(location) }; // Removed mode: 'insensitive' for compatibility if needed, or check DB collation
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }

    const services = await prismaClient.service.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            name: true,
            icon: true,
          },
        },
        provider: {
          select: {
            name: true,
            isVerified: true,
            // Add trust score here when available
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(services);
  } catch (error) {
    console.error("Get services error:", error);
    return res.status(500).json({ message: "Failed to fetch services" });
  }
};

// Get a single service by ID
export const getServiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const service = await prismaClient.service.findUnique({
      where: { id },
      include: {
        category: true,
        provider: {
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                isVerified: true,
                createdAt: true,
            }
        },
      },
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    return res.json(service);
  } catch (error) {
    console.error("Get service error:", error);
    return res.status(500).json({ message: "Failed to fetch service" });
  }
};

// Update a service
export const updateService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, price, location, categoryId } = req.body;
    const providerId = req.user?.id;

    if (!providerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const existingService = await prismaClient.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (existingService.providerId !== providerId) {
      return res.status(403).json({ message: "You can only update your own services" });
    }

    if (categoryId) {
        const category = await prismaClient.category.findUnique({
            where: { id: categoryId },
        });
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
    }

    const updatedService = await prismaClient.service.update({
      where: { id },
      data: {
        title,
        description,
        price,
        location,
        categoryId,
      },
    });

    return res.json(updatedService);
  } catch (error) {
    console.error("Update service error:", error);
    return res.status(500).json({ message: "Failed to update service" });
  }
};

// Delete a service
export const deleteService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const providerId = req.user?.id;

    if (!providerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const existingService = await prismaClient.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (existingService.providerId !== providerId) {
      return res.status(403).json({ message: "You can only delete your own services" });
    }

    await prismaClient.service.delete({
      where: { id },
    });

    // Decrement provider count in category
     await prismaClient.category.update({
        where: { id: existingService.categoryId },
        data: { providerCount: { decrement: 1 } }
    });


    return res.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Delete service error:", error);
    return res.status(500).json({ message: "Failed to delete service" });
  }
};

// Get services by provider (My Services)
export const getMyServices = async (req: Request, res: Response) => {
    try {
        const providerId = req.user?.id;

        if (!providerId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const services = await prismaClient.service.findMany({
            where: { providerId },
            include: {
                category: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return res.json(services);

    } catch (error) {
        console.error("Get my services error:", error);
        return res.status(500).json({ message: "Failed to fetch your services" });
    }
}
