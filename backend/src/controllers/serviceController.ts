import type { Request, Response } from "express";
import prismaClient from "../config/db.ts";

export const createService = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { categoryId, title, description, price, duration, availability } = req.body;

    // Check if provider exists and is verified
    const provider = await prismaClient.provider.findUnique({
      where: { userId: req.user.id },
    });

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    if (provider.verificationStatus !== "VERIFIED") {
      return res.status(403).json({ message: "Provider must be verified to create services" });
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
        price: parseFloat(price),
        duration,
        availability,
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
    res.status(500).json({ message: "Internal server error" });
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
      return res.status(403).json({ message: "Unauthorized to delete this service" });
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
