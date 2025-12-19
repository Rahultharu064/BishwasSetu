import { Router } from "express";
import * as AuthController from "../controllers/authController.ts"
import { authLimiter } from "../config/rateLimit.ts";
import { validationMiddleware } from "../middlewares/validateMiddleware.ts";
import { loginSchema, registerSchema, verifyOtpSchema } from "../validators/authValidator.ts";









const router = Router();


router.post("/register",authLimiter,validationMiddleware(registerSchema),AuthController.registerUser)
router.post("login", authLimiter,validationMiddleware(loginSchema),AuthController.loginUser);
router.post('/verify-otp',authLimiter,validationMiddleware(verifyOtpSchema),AuthController.verifyOTP);
router.post("/logout",AuthController.logout);


export default router;