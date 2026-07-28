import { Router } from 'express'
import * as BadgeController from '../controllers/badgeController'
import { protect, restrictTo } from '../middlewares/authMiddleware'
import { validate } from '../middlewares/validateMiddleware'
import { badgeDocumentUpload } from '../middlewares/uploadMiddleware'
import { PurchaseBadgeSchema, RejectBadgeSchema } from '../validators/badgeValidator'

const router = Router()

// ── Admin routes (declared before the provider guard below) ──────
router.get(
  '/admin/pending',
  protect,
  restrictTo('ADMIN', 'MODERATOR'),
  BadgeController.getPending
)
router.put(
  '/admin/:id/verify',
  protect,
  restrictTo('ADMIN', 'MODERATOR'),
  BadgeController.verify
)
router.put(
  '/admin/:id/reject',
  protect,
  restrictTo('ADMIN', 'MODERATOR'),
  validate(RejectBadgeSchema),
  BadgeController.reject
)

// ── Provider routes ──────────────────────────────────────────────
router.use(protect, restrictTo('PROVIDER'))

router.get('/catalog', BadgeController.getCatalog)
router.get('/me', BadgeController.getMyBadges)
router.post('/document', badgeDocumentUpload, BadgeController.uploadDocument)
router.post('/purchase', validate(PurchaseBadgeSchema), BadgeController.purchase)

export default router
