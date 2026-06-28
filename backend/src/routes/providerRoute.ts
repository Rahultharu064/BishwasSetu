import { Router } from 'express'
import {getPublicProfile} from '../controllers/providerController'
import { protect, restrictTo }  from '../middlewares/authMiddleware'
import { validate }             from '../middlewares/validateMiddleware'
import {
  CompleteProfileSchema,
  UpdateProviderSchema,
} from '../validators/providervalidator'

const router = Router()

// ── Public routes ──────────────────────────────
router.get('/',    searchProviders)
router.get('/:id', getPublicProfile)

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