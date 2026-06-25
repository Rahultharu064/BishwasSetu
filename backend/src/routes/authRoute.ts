import { Router } from 'express'
import * as AuthController from '../controllers/authController'
import { validate } from '../middlewares/validateMiddleware'
import {
  RegisterSchema,
  LoginSchema,
  VerifyOtpSchema,
} from '../validators/authValidator'

const router = Router()

// Public routes
router.post('/register', validate(RegisterSchema), AuthController.register)
router.post('/login', validate(LoginSchema), AuthController.login)
router.post('/verify-otp', validate(VerifyOtpSchema), AuthController.verifyOtp)
router.post('/refresh', AuthController.refresh)
router.post('/logout', AuthController.logout)
router.post('/resend-otp', AuthController.resendOtp)

export default router