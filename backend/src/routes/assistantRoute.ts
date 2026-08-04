import { Router } from 'express'
import * as AssistantController from '../controllers/assistantController'
import { protect, restrictTo, optionalAuth } from '../middlewares/authMiddleware'
import { assistantLimiter }    from '../middlewares/rateMiddleware'
import { validate }            from '../middlewares/validateMiddleware'
import { ChatSchema, FeedbackSchema, KbArticleSchema } from '../validators/assistantValidator'

const router = Router()


router.post(
  '/chat',
  assistantLimiter,
  optionalAuth,
  validate(ChatSchema),
  AssistantController.chat
)

router.post(
  '/feedback',
  assistantLimiter,
  optionalAuth,
  validate(FeedbackSchema),
  AssistantController.submitFeedback
)

// ── Authenticated history ──────────────────────────────────────
router.get(
  '/history/:sessionId',
  protect,
  AssistantController.getHistory
)

// ── Admin KB management ────────────────────────────────────────
router.get(
  '/kb',
  protect,
  restrictTo('ADMIN', 'MODERATOR'),
  AssistantController.listKbArticles
)

router.post(
  '/kb',
  protect,
  restrictTo('ADMIN', 'MODERATOR'),
  validate(KbArticleSchema),
  AssistantController.createKbArticle
)

router.put(
  '/kb/:id',
  protect,
  restrictTo('ADMIN', 'MODERATOR'),
  AssistantController.updateKbArticle
)

router.delete(
  '/kb/:id',
  protect,
  restrictTo('ADMIN'),
  AssistantController.deleteKbArticle
)

export default router