import { Router } from 'express'
import * as PaymentController from '../controllers/paymentController'
import { protect, restrictTo } from '../middlewares/authMiddleware'

const router = Router()

// Initiate payment (provider must be logged in)
router.post(
  '/initiate',
  protect,
  restrictTo('PROVIDER'),
  PaymentController.initiatePurchase
)

// Khalti callback — no auth (Khalti redirects user here)
router.get('/khalti/return',   PaymentController.khaltiReturn)

// eSewa callbacks — no auth (eSewa redirects user here)
router.get('/esewa/success',   PaymentController.esewaSuccess)
router.get('/esewa/failure',   PaymentController.esewaFailure)

export default router