import type { Request, Response } from "express"
import prismaClient from "../config/db.ts"


//create category 
export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name, icon, description } = req.body;
        const existing = await prismaClient.category.findUnique({
            where: { name }
        })
        if (existing) {
            return res.status(400).json({ message: "category already exists" })
        }
        const category = await prismaClient.category.create({
            data: { name, icon, description }
        })
        return res.status(201).json({
            message: "category created successfully",
            category
        })
    } catch (error) {
        console.error("Error creating category:", error);
        return res.status(500).json({ message: "Internal server error creating category" });
    }
}

// get all categories(for public user)
export const getCategory = async (req: Request, res: Response) => {
    try {
        const categories = await prismaClient.category.findMany({
            orderBy: { createdAt: "desc" }
        })
        res.json(categories)
    } catch (error) {
        console.error("Error fetching categories:", error);
        return res.status(500).json({ message: "Internal server error fetching categories" });
    }
}

//search category 
export const searchCategory = async (req: Request, res: Response) => {
    const query = (req.query.query as string) || "";

    const categories = await prismaClient.category.findMany({
        where: {
            name: {
                contains: query,

            }
        },
        orderBy: { createdAt: "desc" } // 
    })
    res.json({
        count: categories.length,
        categories
    })
}

//update category(admin only)
export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                message: "Category ID is required"
            })
        }

        // Check if category exists
        const existing = await prismaClient.category.findUnique({
            where: { id }
        });

        if (!existing) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        const category = await prismaClient.category.update({
            where: { id },
            data: req.body
        })
        res.json({
            message: "category updated",
            category
        })
    } catch (error) {
        console.error("Error updating category:", error);
        return res.status(500).json({ message: "Internal server error updating category" });
    }
}


// delete category 
export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Category ID is needed" })
        }

        // Check if category exists
        const existing = await prismaClient.category.findUnique({
            where: { id }
        });

        if (!existing) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        await prismaClient.category.delete({
            where: { id }
        })
        return res.json({ message: "category deleted successfully" })
    } catch (error) {
        console.error("Error deleting category:", error);
        return res.status(500).json({ message: "Internal server error deleting category" });
    }
}

// Get categories with service and provider statistics
export const getCategoriesWithStats = async (req: Request, res: Response) => {
    try {
        const categories = await prismaClient.category.findMany({
            include: {
                services: {
                    where: {
                        provider: {
                            verificationStatus: "VERIFIED"
                        }
                    },
                    include: {
                        provider: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        const categoriesWithStats = categories.map(category => {
            const uniqueProviders = new Set(
                category.services.map(service => service.providerId)
            );

            return {
                id: category.id,
                name: category.name,
                icon: category.icon,
                description: category.description,
                serviceCount: category.services.length,
                providerCount: uniqueProviders.size,
                // Placeholder for average rating - can be calculated from reviews later
                rating: 4.7
            };
        });

        res.json(categoriesWithStats);
    } catch (error) {
        console.error("Error fetching categories with stats:", error);
        return res.status(500).json({ message: "Internal server error fetching categories" });
    }
}

