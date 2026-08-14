import { Router } from "express";
import { protect } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import * as UserController from "../controllers/userController";
import {
  UpdatePaymentPreferenceSchema,
  UpdateProfileSchema,
  ChangePasswordSchema,
} from "../validators/userValidator";

const router = Router();

router.use(protect);

router.get("/me/payment-preference", UserController.getPaymentPreference);
router.patch(
  "/me/payment-preference",
  validate(UpdatePaymentPreferenceSchema),
  UserController.updatePaymentPreference
);

// Self-service account settings — any signed-in user (customer or provider)
// managing their own row. Email/phone are excluded since they double as
// sign-in credentials — same scope decision as admin-auth's /me endpoint.
router.patch(
  "/me",
  validate(UpdateProfileSchema),
  UserController.updateProfile
);
router.patch(
  "/me/change-password",
  validate(ChangePasswordSchema),
  UserController.changePassword
);

export default router;
