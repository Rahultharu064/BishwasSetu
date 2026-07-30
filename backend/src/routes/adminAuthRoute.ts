import { Router } from 'express'
import * as AdminAuthController from '../controllers/adminAuthController'
import { validate } from '../middlewares/validateMiddleware'
import { AdminLoginSchema } from '../validators/adminAuthValidator'

const router = Router()

// Separate surface from routes/authRoute.ts on purpose: staff accounts are
// never publicly registered, so there is deliberately no /register here —
// only direct credential login (rate-limited via authLimiter in app.ts,
// same as the public login route).
router.post('/login', validate(AdminLoginSchema), AdminAuthController.login)

export default router
