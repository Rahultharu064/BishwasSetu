import { Request, Response, NextFunction } from 'express'
import * as PaymentService from '../services/paymentService'
import { sendSuccess, sendError } from '../utils/response'
import { requireString } from '../utils/reqValue'

// ── Initiate payment ──────────────────────────────────────────

export const initiatePurchase = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await PaymentService.initiateCreditPurchase({
      providerId:    req.user!.providerId!,
      packId:        req.body.packId,
      paymentMethod: req.body.paymentMethod,
      returnUrl:     req.body.returnUrl,
    })
    sendSuccess(res, data, 'Payment initiated')
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}

// ── Khalti: return URL callback ───────────────────────────────
// Called when user is redirected back from Khalti after payment

export const khaltiReturn = async (
  req: Request, res: Response
): Promise<void> => {
  try {
    const result = await PaymentService.handleKhaltiReturn({
      pidx:      requireString(req.query.pidx, "pidx"),
      txnId:     requireString(req.query.txnId, "txnId"),
      amount:    Number(req.query.amount),
      status:    requireString(req.query.status, "status"),
      orderId:   requireString(req.query.purchase_order_id, "purchase_order_id"),
      orderName: requireString(req.query.purchase_order_name, "purchase_order_name"),
      mobile:    requireString(req.query.mobile, "mobile"),
    })

    // Redirect to frontend with result
    const redirectUrl = result.success
      ? `${process.env.FRONTEND_URL}/credits/success?message=${encodeURIComponent(result.message)}`
      : `${process.env.FRONTEND_URL}/credits/failed?message=${encodeURIComponent(result.message)}`

    res.redirect(redirectUrl)
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL}/credits/failed`)
  }
}

// ── eSewa: success callback ───────────────────────────────────

export const esewaSuccess = async (
  req: Request, res: Response
): Promise<void> => {
  try {
    const encodedData = requireString(req.query.data, "data")
    const result      = await PaymentService.handleEsewaReturn(encodedData)

    const redirectUrl = result.success
      ? `${process.env.FRONTEND_URL}/credits/success?message=${encodeURIComponent(result.message)}`
      : `${process.env.FRONTEND_URL}/credits/failed?message=${encodeURIComponent(result.message)}`

    res.redirect(redirectUrl)
  } catch {
    res.redirect(`${process.env.FRONTEND_URL}/credits/failed`)
  }
}

// ── eSewa: failure callback ───────────────────────────────────

export const esewaFailure = async (
  req: Request, res: Response
): Promise<void> => {
  res.redirect(`${process.env.FRONTEND_URL}/credits/failed?reason=payment_cancelled`)
}

// ── Booking escrow payment initiation (PRD §5.1) ─────────────
// Customer calls this AFTER provider accepts the booking

export const initiateBookingPayment = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await PaymentService.initiateBookingPayment({
      bookingId:     requireString(req.params.id, "id"),
      customerId:    req.user!.id,
      paymentMethod: req.body.paymentMethod,
      returnUrl:     req.body.returnUrl,
    })
    sendSuccess(res, data, 'Booking payment initiated')
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}