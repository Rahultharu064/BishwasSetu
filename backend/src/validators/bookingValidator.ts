import Joi from "joi";

export const createBookingSchema = Joi.object({
  providerId: Joi.number().integer().required().messages({
    "number.base": "Provider ID must be a number",
    "number.integer": "Provider ID must be an integer",
    "any.required": "Provider ID is required",
  }),
  serviceId: Joi.number().integer().required().messages({
    "number.base": "Service ID must be a number",
    "number.integer": "Service ID must be an integer",
    "any.required": "Service ID is required",
  }),
  bookingDate: Joi.date().required().messages({
    "date.base": "Booking date must be a valid date",
    "any.required": "Booking date is required",
  }),
  notes: Joi.string().optional().allow("").messages({
    "string.base": "Notes must be a string",
  }),
});

export const updateBookingStatusSchema = Joi.object({
  status: Joi.string()
    .valid("PENDING", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED")
    .required()
    .messages({
      "any.only": "Invalid status",
      "any.required": "Status is required",
    }),
});
