import type { Request, Response } from "express";

import prismaClient from "../config/db.ts";

// ------------------- Create Category -------------------
export const createCategory = async (
  req: Request<{}, {}, { name: string; icon?: string; description?: string }>,
  res: Response<{ message: string; category?: any }>
) => {
  try {
    const { name, icon, description } = req.body;

    const existing = await prismaClient.Category.findUnique({
      where: { name },
    });

    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await prismaClient.Category.create({
      data: { name, icon, description },
    });

    return res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------- Get All Categories -------------------
export const getCategory = async (
  _req: Request,
  res: Response<any[] | { message: string }>
) => {
  try {
    const categories: any[] = await prismaClient.Category.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);

  }
};

// ------------------- Search Category -------------------
export const searchCategory = async (
  req: Request<{}, {}, {}, { query?: string }>,
  res: Response<{ count: number; categories: any[] } | { message: string }>
) => {
  try {
    const searchQuery: string = req.query.query ?? "";

    const categories: any[] = await prismaClient.Category.findMany({
      where: {
        name: {
          contains: searchQuery,
          mode: "insensitive",
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Error searching categories:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------- Update Category -------------------
export const updateCategory = async (
  req: Request<
    { id: string },
    {},
    Partial<{ name: string; icon?: string; description?: string }>
  >,
  res: Response<{ message: string; category?: any }>
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Category ID is required" });
    }

    const existing = await prismaClient.Category.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Category not found" });
    }

    const category = await prismaClient.Category.update({
      where: { id },
      data: req.body,
    });

    return res.json({ message: "Category updated", category });
  } catch (error) {
    console.error("Error updating category:", error);
    ;
  }
};

// ------------------- Delete Category -------------------
export const deleteCategory = async (
  req: Request<{ id: string }>,
  res: Response<{ message: string }>
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Category ID is required" });
    }

    const existing = await prismaClient.Category.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Category not found" });
    }

    await prismaClient.Category.delete({ where: { id } });

    return res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);

  }
};

// ------------------- Get Categories with Stats -------------------
export const getCategoriesWithStats = async (
  _req: Request,
  res: Response<
    | {
      id: string;
      name: string;
      icon?: string | null;
      description?: string | null;
      serviceCount: number;
      providerCount: number;
      rating: number;
    }[]
    | { message: string }
  >
) => {
  try {
    const categories: (any & { service: any[] })[] =
      await prismaClient.Category.findMany({
        include: {
          service: {
            where: { provider: { verificationStatus: "VERIFIED" } },
            include: { provider: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

    const categoriesWithStats = categories.map((category) => {
      const uniqueProviders = new Set(
        category.service.map((service: any) => service.providerId)
      );

      return {
        id: category.id,
        name: category.name,
        icon: category.icon,
        description: category.description,
        serviceCount: category.service.length,
        providerCount: uniqueProviders.size,
        rating: 4.7, // placeholder
      };
    });

    return res.json(categoriesWithStats);
  } catch (error) {
    console.error("Error fetching categories with stats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
