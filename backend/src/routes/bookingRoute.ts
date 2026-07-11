import { Router } from 'express'
import * as BookingController from '../controllers/bookingController'
import * as PaymentController from '../controllers/paymentController'
import { authMiddleware, protect, restrictTo, requireVerifiedProvider } from '../middlewares/authMiddleware'
import { validate } from '../middlewares/validateMiddleware'
import {
  CreateBookingSchema,
  UpdateBookingStatusSchema,
  InitiateBookingPaymentSchema,
} from '../validators/bookingValidator'

const router = Router()

// All booking routes require authentication
router.use(protect)

// ── Customer routes ────────────────────────────────────
router.post(
  '/',
  restrictTo('CUSTOMER'),
  validate(CreateBookingSchema),
  BookingController.createBooking
)

router.get(
  '/customer/me',
  restrictTo('CUSTOMER'),
  BookingController.getCustomerBookings
)

// ── Provider routes ────────────────────────────────────
router.get(
  '/provider/me',
  restrictTo('PROVIDER'),
  requireVerifiedProvider,
  BookingController.getProviderBookings
)

// ── Shared (customer + provider + admin) ───────────────
router.get('/:id', BookingController.getBooking)

router.put(
  '/:id/status',
  restrictTo('CUSTOMER', 'PROVIDER'),
  validate(UpdateBookingStatusSchema),
  BookingController.updateBookingStatus
)

// ── Escrow payment: customer pays after provider accepts (PRD §5.1) ──
router.post(
  '/:id/pay',
  restrictTo('CUSTOMER'),
  validate(InitiateBookingPaymentSchema),
  PaymentController.initiateBookingPayment
)

export default router