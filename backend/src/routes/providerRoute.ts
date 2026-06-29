import { Router } from 'express'
import * as ProviderController from '../controllers/providerController'
import { protect, restrictTo }  from '../middlewares/authMiddleware'
import { validate }             from '../middlewares/validateMiddleware'
import { profilePhotoUpload }   from '../middlewares/uploadMiddleware'
import {
  CompleteProfileSchema,
  UpdateProviderSchema,
} from '../validators/providervalidator'

const router = Router()

// ── Public routes ──────────────────────────────
router.get('/',    ProviderController.searchProviders)
router.get('/:id', ProviderController.getPublicProfile)

// ── Provider-only routes ───────────────────────
router.use(protect, restrictTo('PROVIDER'))

router.get(
  '/me',
  ProviderController.getMyProfile
)

router.post(
  '/me/complete',
  validate(CompleteProfileSchema),
  ProviderController.completeProfile
)

router.put(
  '/me',
  validate(UpdateProviderSchema),
  ProviderController.updateProfile
)

router.get(
  '/me/dashboard',
  ProviderController.getDashboard
)

router.post(
  '/me/photo',
  profilePhotoUpload,
  ProviderController.uploadProfilePhoto
)

export default router