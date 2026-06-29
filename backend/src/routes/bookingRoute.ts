import { Router } from 'express'
import * as BookingController from '../controllers/bookingController'
import { authMiddleware, protect, restrictTo, requireVerifiedProvider } from '../middlewares/authMiddleware'
import { validate } from '../middlewares/validateMiddleware'
import { CreateBookingSchema, UpdateBookingStatusSchema } from '../validators/bookingValidator'

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

export default router