import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters long').max(50, 'Category name cannot exceed 50 characters'),
  nameNp: z.string().min(2).max(100).optional(),
  slug: z.string().min(2).max(100).optional(),
  icon: z.string().max(500, 'Icon URL cannot exceed 500 characters').optional().nullable(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional().nullable(),
})

export const updateCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters long').max(50, 'Category name cannot exceed 50 characters').optional(),
  nameNp: z.string().min(2).max(100).optional(),
  slug: z.string().min(2).max(100).optional(),
  icon: z.string().max(500, 'Icon URL cannot exceed 500 characters').optional().nullable(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional().nullable(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
})
