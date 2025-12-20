import express from "express";
import { authMiddleware, authorize } from "../middlewares/authMiddleware.ts";
import { validate } from "../middlewares/validateMiddleware.ts";
import { uploadSingle } from "../middlewares/multerMiddleware.ts";
import {
  completeProviderProfile,
  uploadProfilePhoto,
  uploadKyc,
  getKycStatus,
  getProviderById
} from "../controllers/providerController.ts";
import { providerProfileSchema, kycUploadSchema } from "../validators/providervalidator.ts";

const router = express.Router();

// Public route
router.get("/:id", getProviderById);

// Protected routes
router.post(
  "/profile/complete",
  authMiddleware,
  authorize(["PROVIDER"]),
  validate(providerProfileSchema),
  completeProviderProfile
);

router.post(
  "/profile/photo",
  authMiddleware,
  authorize(["PROVIDER"]),
  uploadSingle("photo"),
  uploadProfilePhoto
);

router.post(
  "/kyc/upload",
  authMiddleware,
  authorize(["PROVIDER"]),
  uploadSingle("file"),
  validate(kycUploadSchema),
  uploadKyc
);

router.get("/kyc/status", authMiddleware, authorize(["PROVIDER"]), getKycStatus);

export default router;
