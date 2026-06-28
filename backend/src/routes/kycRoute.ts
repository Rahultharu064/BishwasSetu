import { Router } from 'express'
import * as KycController from '../controllers/kycController'
import { protect, restrictTo }  from '../middlewares/authMiddleware'
import { kycUploadFields }      from '../middlewares/uploadMiddleware'

const router = Router()

// ── Provider routes ────────────────────────────
router.post(
  '/upload',
  protect,
  restrictTo('PROVIDER'),
  kycUploadFields,
  KycController.uploadKycDocuments
)

router.get(
  '/status',
  protect,
  restrictTo('PROVIDER'),
  KycController.getKycStatus
)

// ── Admin routes ───────────────────────────────
router.get(
  '/admin/:id/documents',
  protect,
  restrictTo('ADMIN', 'MODERATOR'),
  KycController.getKycDocumentsForAdmin
)

router.put(
  '/admin/:id/approve',
  protect,
  restrictTo('ADMIN', 'MODERATOR'),
  KycController.approveKyc
)

router.put(
  '/admin/:id/reject',
  protect,
  restrictTo('ADMIN', 'MODERATOR'),
  KycController.rejectKyc
)

export default router