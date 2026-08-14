import { Router } from 'express'
import passport from 'passport'
import * as AuthController from '../controllers/authController'
import { validate } from '../middlewares/validateMiddleware'
import {
  RegisterSchema,
  LoginSchema,
  VerifyOtpSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from '../validators/authValidator'

const router = Router()

// Public routes
router.post('/register', validate(RegisterSchema), AuthController.register)
router.post('/login', validate(LoginSchema), AuthController.login)

// ── Google OAuth2 (Passport) ──────────────────────────────────
// Step 1: Browser navigates here → Passport redirects to Google
router.get('/google', (req, res, next) => {
  // Encode the intended redirect URL in the OAuth state parameter
  const redirectTo = typeof req.query.next === 'string' ? req.query.next : '/'
  passport.authenticate('google', {
    scope:   ['profile', 'email'],
    session: false,
    state:   Buffer.from(redirectTo).toString('base64'),   // base64-encode next URL
  })(req, res, next)
})

// Step 2: Google redirects back here after user grants access
router.get(
  '/google/callback',
  (req, res, next) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    passport.authenticate('google', {
      session:         false,
      failureRedirect: `${frontendUrl}/login?error=google_failed`,
    })(req, res, next)
  },
  AuthController.googleCallback
)

router.post('/verify-otp', validate(VerifyOtpSchema), AuthController.verifyOtp)
router.post('/refresh', AuthController.refresh)
router.post('/logout', AuthController.logout)
router.post('/resend-otp', AuthController.resendOtp)
router.post('/forgot-password', validate(ForgotPasswordSchema), AuthController.forgotPassword)
router.post('/reset-password', validate(ResetPasswordSchema), AuthController.resetPassword)

export default router