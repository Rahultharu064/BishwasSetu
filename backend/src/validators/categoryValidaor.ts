import Joi from "joi";

// CREATE CATEGORY
export const createCategorySchema = Joi.object({
  name: Joi.string().min(2).required(),
  icon: Joi.string().min(1).required() // ✅ FIXED
});

// UPDATE CATEGORY
export const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).optional(),
  icon: Joi.string().min(1).optional()
});
