import { Router } from 'express'
import * as MatchController from '../controllers/matchController'
import { protect, restrictTo } from '../middlewares/authMiddleware'
import { validate } from '../middlewares/validateMiddleware'
import { SmartMatchSchema } from '../validators/matchValidator'

const router = Router()

// AI Smart Match — nearest verified providers for a category (customer only).
router.post(
  '/',
  protect,
  restrictTo('CUSTOMER'),
  validate(SmartMatchSchema),
  MatchController.match
)

export default router
