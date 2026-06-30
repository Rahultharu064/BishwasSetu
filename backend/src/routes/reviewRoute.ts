import { Router } from 'express'
import * as ReviewController from '../controllers/reviewController'
import { protect, restrictTo } from '../middlewares/authMiddleware'
import { validate }            from '../middlewares/validateMiddleware'
import { CreateReviewSchema, ProviderReplySchema } from '../validators/reviewValidator'

const router = Router()

// Public
router.get(
  '/provider/:providerId',
  ReviewController.getProviderReviews
)

// Customer — submit review
router.post(
  '/',
  protect,
  restrictTo('CUSTOMER'),
  validate(CreateReviewSchema),
  ReviewController.createReview
)

// Provider — reply to review
router.post(
  '/:id/reply',
  protect,
  restrictTo('PROVIDER'),
  validate(ProviderReplySchema),
  ReviewController.addProviderReply
)

export default router