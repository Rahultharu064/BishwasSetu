import { Request, Response, NextFunction } from 'express'
import * as AdminService     from '../services/adminService'
import * as ComplaintService from '../services/complaintService'
import { sendSuccess, sendError } from '../utils/response'
import { asString, requireString } from '../utils/reqValue'

export const getDashboard = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await AdminService.getDashboardSummary()
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const getRevenue = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await AdminService.getRevenueAnalytics({
      from: asString(req.query.from) || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      to:   asString(req.query.to)   || new Date().toISOString(),
    })
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const getUsers = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await AdminService.getUsers({
      role:   asString(req.query.role),
      search: asString(req.query.search),
      page:   Number(req.query.page  ?? 1),
      limit:  Number(req.query.limit ?? 20),
    })
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const toggleUserStatus = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await AdminService.toggleUserStatus(
      requireString(req.params.id, "id"),
      req.body.isActive
    )
    sendSuccess(res, data, `User ${req.body.isActive ? 'activated' : 'deactivated'}`)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const getProviders = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await AdminService.getProviders({
      identityStatus: asString(req.query.identityStatus),
      search:    asString(req.query.search),
      page:      Number(req.query.page  ?? 1),
      limit:     Number(req.query.limit ?? 20),
    })
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const getKycQueue = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await AdminService.getKycQueue({
      page:  Number(req.query.page  ?? 1),
      limit: Number(req.query.limit ?? 10),
    })
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const approveKyc = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await AdminService.approveKyc(requireString(req.params.id, "id"), req.user!.id)
    sendSuccess(res, data, 'KYC approved and provider notified')
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const rejectKyc = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await AdminService.rejectKyc(
      requireString(req.params.id, "id"),
      req.body.reason,
      req.user!.id
    )
    sendSuccess(res, data, 'KYC rejected and provider notified')
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const requestInfoKyc = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await AdminService.requestInfoKyc(
      requireString(req.params.id, "id"),
      req.body.reason,
      req.user!.id
    )
    sendSuccess(res, data, 'KYC info requested and provider notified')
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const blacklistKyc = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await AdminService.blacklistKyc(
      requireString(req.params.id, "id"),
      req.user!.id
    )
    sendSuccess(res, data, 'Provider blacklisted successfully')
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const getComplaints = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ComplaintService.getAdminComplaints({
      status:   asString(req.query.status),
      severity: asString(req.query.severity),
      page:     Number(req.query.page  ?? 1),
      limit:    Number(req.query.limit ?? 20),
    })
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const resolveComplaint = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ComplaintService.resolveComplaint(
      requireString(req.params.id, "id"),
      req.user!.id,
      req.body
    )
    sendSuccess(res, data, data.message)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const getTrustAnomalies = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await AdminService.getTrustAnomalies()
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const getFraudFlags = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await AdminService.getFraudFlags({
      page:  Number(req.query.page  ?? 1),
      limit: Number(req.query.limit ?? 20),
    })
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const resolveFraudFlag = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await AdminService.resolveFraudFlag(requireString(req.params.id, "id"), req.user!.id)
    sendSuccess(res, data, 'Flag resolved')
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

// ── Skill Evidence Review Queue (v2.3) ─────────────────────────

export const getSkillEvidenceQueue = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await AdminService.getSkillEvidenceQueue({
      status: asString(req.query.status) ?? 'PENDING',
      page:   Number(req.query.page  ?? 1),
      limit:  Number(req.query.limit ?? 20),
    })
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const approveSkillEvidence = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await AdminService.approveSkillEvidence(requireString(req.params.id, "id"), req.user!.id)
    sendSuccess(res, data, 'Skill evidence approved (Tier 1) — provider notified')
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const rejectSkillEvidence = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await AdminService.rejectSkillEvidence(
      requireString(req.params.id, "id"),
      req.body.reason,
      req.user!.id
    )
    sendSuccess(res, data, 'Skill evidence rejected')
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}