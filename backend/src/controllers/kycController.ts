import { Request, Response, NextFunction } from 'express'
import * as KycService from '../services/kycService'
import { sendSuccess, sendError } from '../utils/response'
import { requireString } from '../utils/reqValue'

export const uploadKycDocuments = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const files = req.files as {
      governmentId?: Express.Multer.File[]
      selfie?:       Express.Multer.File[]
      certificate?:  Express.Multer.File[]
    }

    const data = await KycService.uploadKycDocuments(
      req.user!.providerId!,
      files
    )
    sendSuccess(res, data, 'Documents uploaded successfully', 201)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const getKycStatus = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await KycService.getKycStatus(req.user!.providerId!)
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const approveKyc = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await KycService.approveKyc(
      requireString(req.params.id, "id"),
      req.user!.id
    )
    sendSuccess(res, data, 'KYC approved')
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const rejectKyc = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const { reason } = req.body
    const data = await KycService.rejectKyc(
      requireString(req.params.id, "id"),
      reason,
      req.user!.id
    )
    sendSuccess(res, data, 'KYC rejected')
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const getKycDocumentsForAdmin = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await KycService.getKycDocumentsForAdmin(requireString(req.params.id, "id"))
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}