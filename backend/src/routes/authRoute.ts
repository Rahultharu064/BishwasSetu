import { Router } from "express";
import * as AuthController from "../controllers/authController.ts"
import { authLimiter } from "../config/rateLimit.ts";
import { validationMiddleware } from "../middlewares/validateMiddleware.ts";
import { loginSchema, registerSchema, verifyOtpSchema, resendOtpSchema } from "../validators/authValidator.ts";


import { authMiddleware } from "../middlewares/authMiddleware.ts";






const router = Router();


router.post("/register",authLimiter,validationMiddleware(registerSchema),AuthController.registerUser)
router.post("/login", authLimiter,validationMiddleware(loginSchema),AuthController.loginUser);
router.post('/verify-otp',authLimiter,validationMiddleware(verifyOtpSchema),AuthController.verifyOTP);
router.post("/logout",AuthController.logout);
router.post('/resend-otp', authLimiter, validationMiddleware(resendOtpSchema), AuthController.resendOTP);
router.get("/me", authMiddleware, AuthController.getMe);

export default router;
