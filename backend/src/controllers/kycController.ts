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

const SKILL_EVIDENCE_TYPES = ['certificate', 'work_photo', 'reference']

export const submitSkillEvidence = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const type = req.body?.type
    if (!SKILL_EVIDENCE_TYPES.includes(type)) {
      sendError(res, `type must be one of: ${SKILL_EVIDENCE_TYPES.join(', ')}`, 'INVALID_TYPE', 400)
      return
    }
    const files = (req.files as Express.Multer.File[] | undefined) ?? []
    const data = await KycService.submitSkillEvidence(req.user!.providerId!, type, files)
    sendSuccess(res, data, 'Skill evidence submitted', 201)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}