import Joi from "joi";

export const providerProfileSchema = Joi.object({
  legalName: Joi.string().min(3).max(100).required(),
  experienceYears: Joi.number().integer().min(0).max(50).required(),
  bio: Joi.string().min(10).max(500).required(),
  serviceArea: Joi.string().min(2).max(100).required(),
  availability: Joi.string().min(2).max(100).required()
});

export const kycUploadSchema = Joi.object({
  type: Joi.string().valid("GOVERNMENT_ID", "CERTIFICATE", "PROFILE_PHOTO").required()
});
