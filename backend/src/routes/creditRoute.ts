import { Router } from 'express'
import * as CreditsController from '../controllers/creditController'
import { protect, restrictTo } from '../middlewares/authMiddleware'
import { validate }            from '../middlewares/validateMiddleware'
import { PurchaseCreditsSchema, ActivateBoostSchema } from '../validators/creditsValidator'

const router = Router()

// All credit routes require PROVIDER auth
router.use(protect, restrictTo('PROVIDER'))

router.get('/packs',     CreditsController.getCreditPacks)
router.get('/wallet',    CreditsController.getWallet)
router.get('/history',   CreditsController.getCreditHistory)
router.get('/analytics', CreditsController.getBoostAnalytics)

router.post(
  '/purchase',
  validate(PurchaseCreditsSchema),
  CreditsController.purchaseCredits
)

router.post(
  '/boost/activate',
  validate(ActivateBoostSchema),
  CreditsController.activateBoost
)

// Internal service-to-service (booking service calls this on booking accepted)
router.post('/internal/deduct', CreditsController.deductCredits)

export default router