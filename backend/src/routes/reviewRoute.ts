import { Router } from "express";
import { authMiddleware, authorize } from "../middlewares/authMiddleware";
import * as ReviewController from "../controllers/reviewController";

const router = Router();

// Submit review (Customer only)
router.post("/", authMiddleware, authorize(["CUSTOMER"]), ReviewController.createReview);

// Get reviews for provider (Public)
router.get("/provider/:id", ReviewController.getProviderReviews);

// Reply to review (Provider only)
router.post("/:id/reply", authMiddleware, authorize(["PROVIDER"]), ReviewController.replyToReview);

export default router;
