import { Request, Response, NextFunction } from 'express'
import * as ProviderService from '../services/providerService'
import { sendSuccess, sendError }  from '../utils/response'
import { asString, requireString } from '../utils/reqValue'

export const getMyProfile = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ProviderService.getMyProfile(req.user!.providerId!)
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const completeProfile = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ProviderService.completeProfile(req.user!.providerId!, req.body)
    sendSuccess(res, data, 'Profile completed', 201)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const updateProfile = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ProviderService.updateProfile(req.user!.providerId!, req.body)
    sendSuccess(res, data, 'Profile updated')
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const getDashboard = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ProviderService.getDashboard(req.user!.providerId!)
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const getPublicProfile = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ProviderService.getPublicProfile(requireString(req.params.id, "id"))
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const searchProviders = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ProviderService.searchProviders({
      q:          asString(req.query.q),
      category:   asString(req.query.category),
      serviceArea: asString(req.query.serviceArea),
      trustMin:   Number(req.query.trustMin ?? 0),
      sort:       asString(req.query.sort),
      page:       Number(req.query.page  ?? 1),
      limit:      Number(req.query.limit ?? 10),
    })
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const uploadProfilePhoto = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      sendError(res, 'Profile photo file is required', 'MISSING_FILE', 400)
      return
    }
    const data = await ProviderService.uploadProfilePhoto(
      req.user!.providerId!,
      req.file.buffer,
      req.file.mimetype
    )
    sendSuccess(res, data, 'Profile photo uploaded')
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}