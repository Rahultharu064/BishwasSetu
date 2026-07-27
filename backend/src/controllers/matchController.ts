import type { Request, Response, NextFunction } from 'express'
import * as SmartMatch from '../services/smartMatchService'
import { sendSuccess } from '../utils/response'

// ── POST /api/v1/match ────────────────────────────────
// Customer-only. Returns the nearest, AI-spotlighted providers for a category.
export async function match(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await SmartMatch.smartMatch(req.user!.id, req.body)
    sendSuccess(res, result, result.match.aiEnabled ? 'AI matched the best providers near you.' : 'Nearest providers for you.')
  } catch (err: any) {
    if (err?.statusCode) {
      res.status(err.statusCode).json({
        success: false,
        error: { code: 'SMART_MATCH_FAILED', message: err.message, status: err.statusCode },
      })
      return
    }
    next(err)
  }
}
