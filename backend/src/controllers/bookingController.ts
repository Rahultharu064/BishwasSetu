import { Request, Response, NextFunction } from 'express'
import * as BookingService from '../services/bookingService'
import { sendSuccess, sendError } from '../utils/response'
import { asString, requireString } from '../utils/reqValue'

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
      requireString(req.params.id, "id"),
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
      requireString(req.params.id, "id"),
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
      status: asString(req.query.status),
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
    // Guard: provider role without a linked provider profile (onboarding incomplete)
    if (!req.user?.providerId) {
      sendError(res, 'Complete your provider onboarding before viewing bookings.', 'PROVIDER_NOT_FOUND', 403)
      return
    }

    const data = await BookingService.getProviderBookings(
      req.user.providerId,
      {
        status: asString(req.query.status),
        page:   Number(req.query.page  ?? 1),
        limit:  Number(req.query.limit ?? 10),
      }
    )
    sendSuccess(res, data)
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}