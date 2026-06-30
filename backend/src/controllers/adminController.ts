import { Request, Response, NextFunction } from 'express'
import * as AdminService     from '../services/adminService'
import * as ComplaintService from '../services/complaintService'
import { sendSuccess, sendError } from '../utils/response'

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
      from: req.query.from as string || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      to:   req.query.to   as string || new Date().toISOString(),
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
      role:   req.query.role   as string,
      search: req.query.search as string,
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
      req.params.id,
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
      identityStatus: req.query.identityStatus as string,
      search:    req.query.search    as string,
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
    const data = await AdminService.approveKyc(req.params.id, req.user!.id)
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
      req.params.id,
      req.body.reason,
      req.user!.id
    )
    sendSuccess(res, data, 'KYC rejected and provider notified')
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const getComplaints = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ComplaintService.getAdminComplaints({
      status:   req.query.status   as string,
      severity: req.query.severity as string,
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
      req.params.id,
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
    const data = await AdminService.resolveFraudFlag(req.params.id, req.user!.id)
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
      status: req.query.status as string ?? 'PENDING',
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
    const data = await AdminService.approveSkillEvidence(req.params.id, req.user!.id)
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
      req.params.id,
      req.body.reason,
      req.user!.id
    )
    sendSuccess(res, data, 'Skill evidence rejected')
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}