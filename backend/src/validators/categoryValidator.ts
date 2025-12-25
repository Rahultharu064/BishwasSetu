import Joi from "joi";

export const createCategorySchema = Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
        'string.min': 'Category name must be at least 2 characters long',
        'string.max': 'Category name cannot exceed 50 characters',
        'any.required': 'Category name is required'
    }),
    icon: Joi.string().max(500).optional().messages({
        'string.max': 'Icon URL cannot exceed 500 characters'
    }),
    description: Joi.string().max(500).optional().messages({
        'string.max': 'Description cannot exceed 500 characters'
    })
});

export const updateCategorySchema = Joi.object({
    name: Joi.string().min(2).max(50).optional().messages({
        'string.min': 'Category name must be at least 2 characters long',
        'string.max': 'Category name cannot exceed 50 characters'
    }),
    icon: Joi.string().max(500).optional().messages({
        'string.max': 'Icon URL cannot exceed 500 characters'
    }),
    description: Joi.string().max(500).optional().messages({
        'string.max': 'Description cannot exceed 500 characters'
    })
}).min(1).messages({
    'object.min': 'At least one field must be provided for update'
});
