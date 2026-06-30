import { Request, Response, NextFunction } from 'express'
import * as AssistantService from '../services/assistantService'
import { sendSuccess, sendError } from '../utils/response'

// POST /api/v1/assistant/chat — SSE streaming
export const chat = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // streamChat handles SSE headers and response internally
    await AssistantService.streamChat(req.body, req.user?.id, res)
  } catch (err) {
    // SSE already opened — can't send JSON error, log and close
    console.error('Chat controller error:', err)
    if (!res.headersSent) next(err)
    else res.end()
  }
}

// GET /api/v1/assistant/history/:sessionId
export const getHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await AssistantService.getSessionHistory(
      req.params.sessionId,
      req.user!.id
    )
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

// ── Admin KB management ────────────────────────────────────────

export const createKbArticle = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await AssistantService.createKbArticle(req.body)
    sendSuccess(res, data, 'KB article created', 201)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const updateKbArticle = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await AssistantService.updateKbArticle(req.params.id, req.body)
    sendSuccess(res, data, 'KB article updated')
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const deleteKbArticle = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await AssistantService.deleteKbArticle(req.params.id)
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const listKbArticles = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await AssistantService.listKbArticles({
      category: req.query.category as string,
      lang:     req.query.lang     as string,
      page:     Number(req.query.page  ?? 1),
      limit:    Number(req.query.limit ?? 20),
    })
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}