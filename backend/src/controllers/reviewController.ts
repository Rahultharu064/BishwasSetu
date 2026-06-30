import { Request, Response, NextFunction } from 'express'
import * as ReviewService from '../services/reviewService'
import { sendSuccess, sendError } from '../utils/response'

export const createReview = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ReviewService.createReview(req.user!.id, req.body)
    sendSuccess(res, data, 'Review submitted', 201)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const addProviderReply = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ReviewService.addProviderReply(
      req.params.id,
      req.user!.providerId!,
      req.body
    )
    sendSuccess(res, data, 'Reply added')
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const getProviderReviews = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ReviewService.getProviderReviews(req.params.providerId, {
      page:   Number(req.query.page   ?? 1),
      limit:  Number(req.query.limit  ?? 10),
      rating: req.query.rating ? Number(req.query.rating) : undefined,
    })
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}