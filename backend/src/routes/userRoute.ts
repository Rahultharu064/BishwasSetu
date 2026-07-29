import { Router } from "express";
import { protect } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import * as UserController from "../controllers/userController";
import { UpdatePaymentPreferenceSchema } from "../validators/userValidator";

const router = Router();

router.use(protect);

router.get("/me/payment-preference", UserController.getPaymentPreference);
router.patch(
  "/me/payment-preference",
  validate(UpdatePaymentPreferenceSchema),
  UserController.updatePaymentPreference
);

export default router;
