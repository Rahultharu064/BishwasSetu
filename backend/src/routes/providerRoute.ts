import express from "express";
import { authMiddleware, authorize } from "../middlewares/authMiddleware.ts";
import { validate } from "../middlewares/validateMiddleware.ts";
import {
    becomeProvider,
    completeProviderProfile,
    uploadProfilePhoto,
    uploadKyc,
    getKycStatus,
    getProviderById,
    getMyProviderProfile,
    getAllVerifiedProviders,
    searchProviders
} from "../controllers/providerController.ts";
import {providerCreateSchema, providerUpdateSchema ,kycUploadSchema} from "../validators/providervalidator.ts";
import { providerOnboardingUpload ,uploadSingle} from "../middlewares/multerMiddleware.ts"; // Import the new upload config

const router = express.Router();

// Public routes
router.get("/", getAllVerifiedProviders);
router.get("/:id", getProviderById);

// Protected routes

// BECOME PROVIDER - For new providers (USER role)
router.post(
    "/become-provider",
    authMiddleware,
    providerOnboardingUpload, // Use the new config
    becomeProvider
);

// COMPLETE PROFILE - For existing providers (PROVIDER role)
router.put(
    "/profile/complete",
    authMiddleware,
    authorize(["PROVIDER"]),
    providerOnboardingUpload, // Use the same config
    completeProviderProfile
);

// SINGLE UPLOAD ENDPOINTS
router.post(
    "/profile/photo",
    authMiddleware,
    authorize(["PROVIDER"]),
    uploadSingle("photo"),
    uploadProfilePhoto
);
// Add to your router file
router.get("/profile/me", authMiddleware, authorize(["PROVIDER"]), getMyProviderProfile);

router.post(
    "/kyc/upload",
    authMiddleware,
    authorize(["PROVIDER"]),
    uploadSingle("file"),
    validate(kycUploadSchema),
    uploadKyc
);

router.get("/kyc/status", authMiddleware, authorize(["PROVIDER"]), getKycStatus);
router.get("/search", authMiddleware, authorize(["PROVIDER"]), searchProviders);

export default router;
