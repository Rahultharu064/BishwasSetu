import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
  role: Joi.string()
    .valid("CUSTOMER", "PROVIDER")
    .required()
    .messages({
      "any.only": "Invalid role selected",
      "any.required": "Role is required",
    }),
});


// Login validation schema
export const loginSchema = Joi.object({
    identifier: Joi.string().required().messages({
        "string.base": "Identifier must be a string",
        "string.empty": "Identifier is required",
        "any.required": "Identifier is required",
    }),
    password: Joi.string().required().messages({
        "string.base": "Password must be a string",
        "string.empty": "Password is required",
        "any.required": "Password is required",
    }),
})

export const verifyOtpSchema = Joi.object({
  userId: Joi.alternatives()
    .try(Joi.number().integer(), Joi.string().pattern(/^\d+$/))
    .required(),
  otp: Joi.string().length(6).required()
});

export const resendOtpSchema = Joi.object({
  userId: Joi.alternatives()
    .try(Joi.number().integer(), Joi.string().pattern(/^\d+$/))
    .required(),
});
