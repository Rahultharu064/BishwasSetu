import { Router } from 'express'
import * as AssistantController from '../controllers/assistantController'
import { protect, restrictTo } from '../middlewares/authMiddleware'
import { validate }            from '../middlewares/validateMiddleware'
import { ChatSchema, KbArticleSchema } from '../validators/assistantValidator'

const router = Router()


router.post(
  '/chat',
  (req, res, next) => {
    // Try to authenticate but don't block if no token
    protect(req, res, () => next())
  },
  validate(ChatSchema),
  AssistantController.chat
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