import type { Request, Response } from "express";

import prismaClient from "../config/db";

// ------------------- Create Category -------------------
export const createCategory = async (
  req: Request<{}, {}, { name: string; nameNp?: string; slug?: string; icon?: string; description?: string }>,
  res: Response<{ message: string; category?: any }>
) => {
  try {
    const { name, nameNp, slug, icon, description } = req.body;

    const existing = await prismaClient.category.findUnique({
      where: { name },
    });

    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await prismaClient.category.create({
data: {
      name,
      nameNp: nameNp || name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      icon: icon ?? null,
      description: description ?? null,
    }
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
    const categories: any[] = await prismaClient.category.findMany({
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

    const categories: any[] = await prismaClient.category.findMany({
      where: {
        name: {
          contains: searchQuery
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

    const existing = await prismaClient.category.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Category not found" });
    }

    const category = await prismaClient.category.update({
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

    const existing = await prismaClient.category.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Category not found" });
    }

    await prismaClient.category.delete({ where: { id } });

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
    const categories = await prismaClient.category.findMany({
      include: {
        _count: {
          select: { subCategories: true, providers: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    const categoriesWithStats = categories.map((category) => {
      return {
        id: category.id,
        name: category.name,
        icon: category.icon,
        description: category.description,
        serviceCount: category._count.subCategories,
        providerCount: category._count.providers,
        rating: 4.7, // placeholder
      };
    });

    return res.json(categoriesWithStats);
  } catch (error) {
    console.error("Error fetching categories with stats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
