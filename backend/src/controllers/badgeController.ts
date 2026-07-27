import type { Request, Response, NextFunction } from 'express'
import * as BadgeService from '../services/badgeService'
import { sendSuccess, sendError } from '../utils/response'

const handle = (err: any, res: Response, next: NextFunction) => {
  if (err?.code && err?.status) {
    sendError(res, err.message, err.code, err.status)
    return
  }
  next(err)
}

// ── GET /api/v1/badges/catalog (provider) ──────────────
export const getCatalog = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    sendSuccess(res, await BadgeService.getBadgeCatalog(), 'Badge catalog')
  } catch (err) {
    handle(err, res, next)
  }
}

// ── GET /api/v1/badges/me (provider) ───────────────────
export const getMyBadges = async (req: Request, res: Response, next: NextFunction) => {
  try {
    sendSuccess(res, await BadgeService.getMyBadges(req.user!.providerId!), 'Your badges')
  } catch (err) {
    handle(err, res, next)
  }
}

// ── POST /api/v1/badges/document (provider, multipart) ──
export const uploadDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file
    if (!file) {
      sendError(res, 'No document uploaded (field: document)', 'NO_FILE', 400)
      return
    }
    const result = await BadgeService.uploadBadgeDocument(
      req.user!.providerId!,
      file.buffer,
      file.mimetype
    )
    sendSuccess(res, result, 'Document uploaded')
  } catch (err) {
    handle(err, res, next)
  }
}

// ── POST /api/v1/badges/purchase (provider) ────────────
export const purchase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await BadgeService.purchaseBadge(req.user!.providerId!, req.body)
    sendSuccess(res, result, result.message, 201)
  } catch (err) {
    handle(err, res, next)
  }
}

// ── ADMIN: GET /api/v1/badges/admin/pending ────────────
export const getPending = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page ?? 1)
    const limit = Number(req.query.limit ?? 20)
    sendSuccess(res, await BadgeService.getPendingBadges({ page, limit }), 'Pending badges')
  } catch (err) {
    handle(err, res, next)
  }
}

// ── ADMIN: PUT /api/v1/badges/admin/:id/verify ─────────
export const verify = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await BadgeService.verifyBadge(req.params.id as string, req.user!.id)
    sendSuccess(res, result, result.message)
  } catch (err) {
    handle(err, res, next)
  }
}

// ── ADMIN: PUT /api/v1/badges/admin/:id/reject ─────────
export const reject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await BadgeService.rejectBadge(
      req.params.id as string,
      req.user!.id,
      req.body.reason
    )
    sendSuccess(res, result, result.message)
  } catch (err) {
    handle(err, res, next)
  }
}
