import { Router } from 'express'
import * as KycController from '../controllers/kycController'
import { protect, restrictTo }  from '../middlewares/authMiddleware'
import { kycUploadFields, skillEvidenceUpload } from '../middlewares/uploadMiddleware'

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

router.post(
  '/skill-evidence',
  protect,
  restrictTo('PROVIDER'),
  skillEvidenceUpload,
  KycController.submitSkillEvidence
)

// ── Admin routes ───────────────────────────────
router.get(
  '/admin/:id/documents',
  protect,
  restrictTo('ADMIN', 'MODERATOR'),
  KycController.getKycDocumentsForAdmin
)

// Approve/reject live under /admin/kyc/:id/{approve,reject} (adminRoute.ts) —
// that's the real, notification-wired admin review flow the frontend uses.

export default router