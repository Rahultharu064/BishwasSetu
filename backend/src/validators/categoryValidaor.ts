import Joi from "joi";

export const createCategorySchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  icon: Joi.string().uri().required()
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(3).max(50).optional(),
  icon: Joi.string().uri().optional()
});
