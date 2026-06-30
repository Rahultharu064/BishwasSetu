import { Request, Response, NextFunction } from 'express'
import * as ComplaintService from '../services/complaintService'
import { sendSuccess, sendError } from '../utils/response'

export const createComplaint = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ComplaintService.createComplaint(req.user!.id, req.body)
    sendSuccess(res, data, data.message)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const getCustomerComplaints = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ComplaintService.getCustomerComplaints(req.user!.id, {
      page:  Number(req.query.page  ?? 1),
      limit: Number(req.query.limit ?? 20),
    })
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const getComplaint = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await ComplaintService.getComplaint(req.params.id, req.user!.id, req.user!.role)
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}
