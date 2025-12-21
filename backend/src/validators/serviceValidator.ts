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
  }),
  price: Joi.number().min(0).precision(2).required().messages({
    'number.min': 'Price must be greater than or equal to 0',
    'number.precision': 'Price must have at most 2 decimal places',
    'any.required': 'Price is required'
  }),
  duration: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Duration must be at least 2 characters long',
    'string.max': 'Duration cannot exceed 50 characters',
    'any.required': 'Duration is required'
  }),
  availability: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Availability must be at least 2 characters long',
    'string.max': 'Availability cannot exceed 100 characters',
    'any.required': 'Availability is required'
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
  }),
  price: Joi.number().min(0).precision(2).optional().messages({
    'number.min': 'Price must be greater than or equal to 0',
    'number.precision': 'Price must have at most 2 decimal places'
  }),
  duration: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'Duration must be at least 2 characters long',
    'string.max': 'Duration cannot exceed 50 characters'
  }),
  availability: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Availability must be at least 2 characters long',
    'string.max': 'Availability cannot exceed 100 characters'
  })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});
