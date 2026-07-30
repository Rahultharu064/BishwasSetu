import { Router } from 'express'
import * as AdminAuthController from '../controllers/adminAuthController'
import { protect, restrictTo } from '../middlewares/authMiddleware'
import { validate } from '../middlewares/validateMiddleware'
import {
  AdminLoginSchema,
  AdminUpdateProfileSchema,
  AdminChangePasswordSchema,
} from '../validators/adminAuthValidator'

const router = Router()

// Separate surface from routes/authRoute.ts on purpose: staff accounts are
// never publicly registered, so there is deliberately no /register here —
// only direct credential login (rate-limited via authLimiter in app.ts,
// same as the public login route).
router.post('/login', validate(AdminLoginSchema), AdminAuthController.login)

// Self-service account settings — the signed-in admin/moderator managing
// their own row, not the admin/users management endpoints in adminRoute.ts.
router.patch(
  '/me',
  protect, restrictTo('ADMIN', 'MODERATOR'),
  validate(AdminUpdateProfileSchema),
  AdminAuthController.updateProfile
)
router.patch(
  '/change-password',
  protect, restrictTo('ADMIN', 'MODERATOR'),
  validate(AdminChangePasswordSchema),
  AdminAuthController.changePassword
)

export default router
