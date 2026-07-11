import { Request, Response, NextFunction } from 'express'
import * as PaymentService from '../services/paymentService'
import { sendSuccess, sendError } from '../utils/response'

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
      pidx:      req.query.pidx      as string,
      txnId:     req.query.txnId     as string,
      amount:    Number(req.query.amount),
      status:    req.query.status    as string,
      orderId:   req.query.purchase_order_id   as string,
      orderName: req.query.purchase_order_name as string,
      mobile:    req.query.mobile    as string,
    })

    // Redirect to frontend with result
    const redirectUrl = result.success
      ? `${process.env.CLIENT_URL}/credits/success?message=${encodeURIComponent(result.message)}`
      : `${process.env.CLIENT_URL}/credits/failed?message=${encodeURIComponent(result.message)}`

    res.redirect(redirectUrl)
  } catch (err) {
    res.redirect(`${process.env.CLIENT_URL}/credits/failed`)
  }
}

// ── eSewa: success callback ───────────────────────────────────

export const esewaSuccess = async (
  req: Request, res: Response
): Promise<void> => {
  try {
    const encodedData = req.query.data as string
    const result      = await PaymentService.handleEsewaReturn(encodedData)

    const redirectUrl = result.success
      ? `${process.env.CLIENT_URL}/credits/success`
      : `${process.env.CLIENT_URL}/credits/failed`

    res.redirect(redirectUrl)
  } catch {
    res.redirect(`${process.env.CLIENT_URL}/credits/failed`)
  }
}

// ── eSewa: failure callback ───────────────────────────────────

export const esewaFailure = async (
  req: Request, res: Response
): Promise<void> => {
  res.redirect(`${process.env.CLIENT_URL}/credits/failed?reason=payment_cancelled`)
}

// ── Booking escrow payment initiation (PRD §5.1) ─────────────
// Customer calls this AFTER provider accepts the booking

export const initiateBookingPayment = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const data = await PaymentService.initiateBookingPayment({
      bookingId:     req.params.id,
      customerId:    req.user!.id,
      paymentMethod: req.body.paymentMethod,
      returnUrl:     req.body.returnUrl,
    })
    sendSuccess(res, data, 'Booking payment initiated')
  } catch (err: any) {
    err.code ? sendError(res, err.message, err.code, err.status) : next(err)
  }
}