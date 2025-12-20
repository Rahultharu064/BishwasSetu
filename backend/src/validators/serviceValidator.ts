import { z } from "zod";

export const createServiceSchema = z.object({
  body: z.object({
    title: z.string().min(5, "Title must be at least 5 characters long"),
    description: z.string().min(20, "Description must be at least 20 characters long"),
    price: z.number().min(0, "Price must be a positive number"),
    location: z.string().min(3, "Location is required"),
    categoryId: z.string().uuid("Invalid category ID"),
  }),
});

export const updateServiceSchema = z.object({
  body: z.object({
    title: z.string().min(5, "Title must be at least 5 characters long").optional(),
    description: z.string().min(20, "Description must be at least 20 characters long").optional(),
    price: z.number().min(0, "Price must be a positive number").optional(),
    location: z.string().min(3, "Location is required").optional(),
    categoryId: z.string().uuid("Invalid category ID").optional(),
  }),
});
