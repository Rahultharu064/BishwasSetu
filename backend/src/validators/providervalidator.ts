import Joi from "joi";

export const providerCreateSchema = Joi.object({
  // Personal Info
  gender: Joi.string().valid("Male", "Female", "Other", "Prefer not to say").optional(),
  address: Joi.string().max(255).optional(),
  district: Joi.string().max(100).optional(),
  municipality: Joi.string().max(100).optional(),

  // Professional Info
  categoryId: Joi.string().optional(),
  legalName: Joi.string().min(3).max(100).required(),
  experienceYears: Joi.number().integer().min(0).max(50).required(),
  bio: Joi.string().min(150).max(1000).required(),
  skills: Joi.string().allow(null, "").optional(),

  prevCompany: Joi.string().allow(null, "").optional(),
  prevRole: Joi.string().allow(null, "").optional(),
  workDuration: Joi.string().allow(null, "").optional(),

  portfolioUrls: Joi.string().allow(null, "").optional(),

  serviceDistrict: Joi.string().optional(),
  serviceMunicipality: Joi.string().optional(),
  availabilityDays: Joi.string().optional(),
  availabilityTime: Joi.string().optional(),

  isEmergencyAvailable: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid("true", "false")
  ).optional(),

  emergencyResponseTime: Joi.string().optional(),
  emergencyExtraCharge: Joi.alternatives().try(
    Joi.number().min(0),
    Joi.string().allow("")
  ).optional(),

  price: Joi.alternatives().try(
    Joi.number().min(0),
    Joi.string().allow("")
  ).optional(),

  duration: Joi.string().min(2).max(50).optional()
});


export const providerUpdateSchema = Joi.object({
  gender: Joi.string().valid("Male", "Female", "Other", "Prefer not to say").optional(),
  address: Joi.string().max(255).optional(),
  district: Joi.string().max(100).optional(),
  municipality: Joi.string().max(100).optional(),

  categoryId: Joi.string().optional(),
  legalName: Joi.string().min(3).max(100).optional(),
  experienceYears: Joi.number().integer().min(0).max(50).optional(),
  bio: Joi.string().min(150).max(1000).optional(),
  skills: Joi.string().allow(null, "").optional(),

  prevCompany: Joi.string().allow(null, "").optional(),
  prevRole: Joi.string().allow(null, "").optional(),
  workDuration: Joi.string().allow(null, "").optional(),

  portfolioUrls: Joi.string().allow(null, "").optional(),

  serviceDistrict: Joi.string().optional(),
  serviceMunicipality: Joi.string().optional(),
  availabilityDays: Joi.string().optional(),
  availabilityTime: Joi.string().optional(),

  isEmergencyAvailable: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid("true", "false")
  ).optional(),

  emergencyResponseTime: Joi.string().optional(),
  emergencyExtraCharge: Joi.alternatives().try(
    Joi.number().min(0),
    Joi.string().allow("")
  ).optional(),

  price: Joi.alternatives().try(
    Joi.number().min(0),
    Joi.string().allow("")
  ).optional(),

  duration: Joi.string().min(2).max(50).optional(),
  verificationStatus: Joi.string().optional()
}).min(1); // 🔥 REQUIRED: at least one field

export const kycUploadSchema = Joi.object({
  type: Joi.string().valid("GOVERNMENT_ID", "CERTIFICATE", "PROFILE_PHOTO").required()
});
