import { Router } from "express";
import * as BookingController from "../controllers/bookingController";
import { validationMiddleware } from "../middlewares/validateMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";
import { createBookingSchema, updateBookingStatusSchema } from "../validators/bookingValidator";

const router = Router();

// Create a new booking (Customer only)
router.post("/", authMiddleware, validationMiddleware(createBookingSchema), BookingController.createBooking);

// Get booking by ID (Customer, Provider, Admin)
router.get("/:id", authMiddleware, BookingController.getBookingById);

// Get bookings for customer (Customer only)
router.get("/customer/my-bookings", authMiddleware, BookingController.getCustomerBookings);

// Get bookings for provider (Provider only)
router.get("/provider/my-bookings", authMiddleware, BookingController.getProviderBookings);

// Update booking status (Provider or Admin only)
router.put("/:id/status", authMiddleware, validationMiddleware(updateBookingStatusSchema), BookingController.updateBookingStatus);

export default router;
