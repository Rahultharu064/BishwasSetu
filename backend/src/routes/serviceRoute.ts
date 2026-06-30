import { Router } from 'express'
import * as ServiceController from '../controllers/serviceController'
import { protect, restrictTo } from '../middlewares/authMiddleware'
import { validate }            from '../middlewares/validateMiddleware'
import {
  CreateCategorySchema,
  CreateSubCategorySchema,
  CreateServiceSchema,
} from '../validators/serviceValidator'

const router = Router()

// ── Public routes ─────────────────────────────────────────────

// Search across all levels
router.get('/search', ServiceController.searchServices)

// Level 1 — Categories
router.get('/',              ServiceController.getAllCategories)
router.get('/:slug',         ServiceController.getCategoryBySlug)
router.get('/:slug/providers', ServiceController.getProvidersByCategory)
router.get('/:slug/sub',     ServiceController.getSubCategories)

// Level 2 — Sub-categories
router.get('/:categorySlug/sub/:subSlug',  ServiceController.getSubCategoryBySlug)

// Level 3 — Specific services
router.get(
  '/:categorySlug/sub/:subSlug/services',
  ServiceController.getServices
)
router.get(
  '/:categorySlug/sub/:subSlug/:serviceSlug',
  ServiceController.getServiceBySlug
)

// ── Admin routes ───────────────────────────────────────────────

// Categories
router.post(
  '/',
  protect, restrictTo('ADMIN'),
  validate(CreateCategorySchema),
  ServiceController.createCategory
)
router.put(
  '/:id',
  protect, restrictTo('ADMIN'),
  ServiceController.updateCategory
)
router.patch(
  '/:id/toggle',
  protect, restrictTo('ADMIN'),
  ServiceController.toggleCategory
)

// Sub-categories
router.post(
  '/sub',
  protect, restrictTo('ADMIN'),
  validate(CreateSubCategorySchema),
  ServiceController.createSubCategory
)
router.put(
  '/sub/:id',
  protect, restrictTo('ADMIN'),
  ServiceController.updateSubCategory
)

// Services
router.post(
  '/service',
  protect, restrictTo('ADMIN'),
  validate(CreateServiceSchema),
  ServiceController.createService
)
router.put(
  '/service/:id',
  protect, restrictTo('ADMIN'),
  ServiceController.updateService
)
router.patch(
  '/service/:id/toggle',
  protect, restrictTo('ADMIN'),
  ServiceController.toggleService
)

export default router