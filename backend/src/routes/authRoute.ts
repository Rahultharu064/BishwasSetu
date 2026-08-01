import { Router } from 'express'
import * as AuthController from '../controllers/authController'
import { validate } from '../middlewares/validateMiddleware'
import {
  RegisterSchema,
  LoginSchema,
  VerifyOtpSchema,
} from '../validators/authValidator'

const router = Router()

import passport from 'passport'

// Public routes
router.post('/register', validate(RegisterSchema), AuthController.register)
router.post('/login', validate(LoginSchema), AuthController.login)

// Google OAuth routes
router.get(
  '/google',
  (req, res, next) => {
    const state = req.query.state ? String(req.query.state) : '/'
    passport.authenticate('google', { scope: ['profile', 'email'], session: false, state })(req, res, next)
  }
)

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=GoogleAuthFailed` }),
  AuthController.googleCallback
)

router.post('/verify-otp', validate(VerifyOtpSchema), AuthController.verifyOtp)
router.post('/refresh', AuthController.refresh)
router.post('/logout', AuthController.logout)
router.post('/resend-otp', AuthController.resendOtp)

export default router