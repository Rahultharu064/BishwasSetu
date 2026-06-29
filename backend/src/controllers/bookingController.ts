import { Request, Response, NextFunction } from 'express'
import * as BookingService from '../services/bookingService'
import { sendSuccess, sendError } from '../utils/response'

export const createBooking = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await BookingService.createBooking(req.user!.id, req.body)
    sendSuccess(res, data, 'Booking created', 201)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const updateBookingStatus = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const actorRole = req.user!.role === 'PROVIDER' ? 'PROVIDER' : 'CUSTOMER'
    const actorId   = actorRole === 'PROVIDER'
      ? req.user!.providerId!
      : req.user!.id

    const data = await BookingService.updateBookingStatus(
      req.params.id,
      actorId,
      actorRole,
      req.body
    )
    sendSuccess(res, data, data.message)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const getBooking = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await BookingService.getBooking(
      req.params.id,
      req.user!.id,
      req.user!.role
    )
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const getCustomerBookings = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await BookingService.getCustomerBookings(req.user!.id, {
      status: req.query.status as string,
      page:   Number(req.query.page  ?? 1),
      limit:  Number(req.query.limit ?? 10),
    })
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

export const getProviderBookings = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await BookingService.getProviderBookings(
      req.user!.providerId!,
      {
        status: req.query.status as string,
        page:   Number(req.query.page  ?? 1),
        limit:  Number(req.query.limit ?? 10),
      }
    )
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}