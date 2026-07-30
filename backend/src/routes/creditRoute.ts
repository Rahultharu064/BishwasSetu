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

// Not currently called over HTTP — `deductCredits` is invoked as a direct
// function import from paymentService.ts. This route sits behind the same
// PROVIDER-JWT gate as the rest of this router (line above), so it is NOT
// a no-auth internal endpoint; don't build a service-to-service caller
// against it without adding real internal auth first.
router.post('/internal/deduct', CreditsController.deductCredits)

export default router