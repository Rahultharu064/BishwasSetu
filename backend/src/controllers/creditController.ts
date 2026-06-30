import { Request, Response, NextFunction } from 'express'
import * as CreditsService from '../services/creditService'
import { sendSuccess, sendError } from '../utils/response'

export const getWallet = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await CreditsService.getWallet(req.user!.providerId!)
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const getCreditPacks = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await CreditsService.getCreditPacks()
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const purchaseCredits = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await CreditsService.purchaseCredits(
      req.user!.providerId!, req.body
    )
    sendSuccess(res, data, data.message, 201)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const getCreditHistory = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await CreditsService.getCreditHistory(req.user!.providerId!, {
      page:  Number(req.query.page  ?? 1),
      limit: Number(req.query.limit ?? 20),
    })
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const activateBoost = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await CreditsService.activateBoost(
      req.user!.providerId!, req.body
    )
    sendSuccess(res, data, data.message)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const getBoostAnalytics = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await CreditsService.getBoostAnalytics(req.user!.providerId!)
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

// Internal endpoint — called by booking service when boost booking accepted
export const deductCredits = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    await CreditsService.deductCredits(req.body)
    sendSuccess(res, null, 'Credits deducted')
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}