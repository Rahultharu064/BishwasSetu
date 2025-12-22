import Joi from "joi";

export const createServiceSchema = Joi.object({
  categoryId: Joi.string().uuid().required().messages({
    'string.guid': 'Category ID must be a valid UUID',
    'any.required': 'Category ID is required'
  }),
  title: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Title must be at least 3 characters long',
    'string.max': 'Title cannot exceed 100 characters',
    'any.required': 'Title is required'
  }),
  description: Joi.string().min(10).max(500).required().messages({
    'string.min': 'Description must be at least 10 characters long',
    'string.max': 'Description cannot exceed 500 characters',
    'any.required': 'Description is required'
  })
});

export const updateServiceSchema = Joi.object({
  categoryId: Joi.string().uuid().optional().messages({
    'string.guid': 'Category ID must be a valid UUID'
  }),
  title: Joi.string().min(3).max(100).optional().messages({
    'string.min': 'Title must be at least 3 characters long',
    'string.max': 'Title cannot exceed 100 characters'
  }),
  description: Joi.string().min(10).max(500).optional().messages({
    'string.min': 'Description must be at least 10 characters long',
    'string.max': 'Description cannot exceed 500 characters'
  })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

export const searchServiceSchema = Joi.object({
  search: Joi.string().allow('').optional(),
  category: Joi.string().allow('').optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  sortBy: Joi.string().valid('createdAt', 'price_asc', 'price_desc', 'title').optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional()
});

