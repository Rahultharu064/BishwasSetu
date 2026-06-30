import axios    from 'axios'
import crypto   from 'crypto'
import { prisma } from '../config/db'
import { deductCredits } from '../services/creditService'

// ═══════════════════════════════════════════
// KHALTI
// ═══════════════════════════════════════════

// Khalti: initiate payment
export const initiateKhaltiPayment = async (params: {
  amount:    number    // in NPR
  orderId:   string
  orderName: string
  returnUrl: string
}) => {
  const { amount, orderId, orderName, returnUrl } = params

  const response = await axios.post(
    'https://a.khalti.com/api/v2/epayment/initiate/',
    {
      return_url:   returnUrl,
      website_url:  process.env.CLIENT_URL,
      amount:       amount * 100,   // Khalti uses paisa
      purchase_order_id:   orderId,
      purchase_order_name: orderName,
    },
    {
      headers: {
        Authorization:  `Key ${process.env.KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    }
  )

  return {
    paymentUrl: response.data.payment_url,
    pidx:       response.data.pidx,
  }
}

// Khalti: verify payment (called from webhook OR return URL)
export const verifyKhaltiPayment = async (pidx: string) => {
  const response = await axios.post(
    'https://a.khalti.com/api/v2/epayment/lookup/',
    { pidx },
    {
      headers: {
        Authorization:  `Key ${process.env.KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    }
  )

  return {
    status:        response.data.status,          // 'Completed' | 'Pending' | 'Failed'
    transactionId: response.data.transaction_id,
    totalAmount:   Math.round(response.data.total_amount / 100),  // back to NPR
    orderId:       response.data.purchase_order_id,
  }
}

// Khalti: handle return URL callback (user redirected back after payment)
export const handleKhaltiReturn = async (params: {
  pidx:      string
  txnId:     string
  amount:    number
  status:    string
  orderId:   string
  orderName: string
  mobile:    string
}) => {
  const { pidx, orderId, status } = params

  if (status !== 'Completed') {
    return { success: false, message: 'Payment not completed' }
  }

  // Verify with Khalti (never trust frontend-only data)
  const verified = await verifyKhaltiPayment(pidx)

  if (verified.status !== 'Completed') {
    return { success: false, message: 'Payment verification failed' }
  }

  // Find what this order is for
  return processPaymentOrder(orderId, 'KHALTI', verified.transactionId)
}

// ═══════════════════════════════════════════
// ESEWA
// ═══════════════════════════════════════════

// eSewa uses HMAC-SHA256 signature verification
const verifyEsewaSignature = (
  message:    string,
  signature:  string,
  secretKey:  string
): boolean => {
  const hmac     = crypto.createHmac('sha256', secretKey)
  hmac.update(message)
  const expected = hmac.digest('base64')
  return expected === signature
}

// eSewa: handle success callback (user redirected back)
export const handleEsewaReturn = async (encodedData: string) => {
  try {
    // eSewa returns base64-encoded JSON
    const decoded = JSON.parse(Buffer.from(encodedData, 'base64').toString('utf-8'))

    const {
      transaction_uuid,
      product_code,
      signed_field_names,
      signature,
      status,
      total_amount,
    } = decoded

    if (status !== 'COMPLETE') {
      return { success: false, message: 'Payment not complete' }
    }

    // Build message string for HMAC verification
    const fields  = signed_field_names.split(',')
    const message = fields.map((f: string) => `${f}=${decoded[f]}`).join(',')

    const isValid = verifyEsewaSignature(
      message,
      signature,
      process.env.ESEWA_SECRET_KEY!
    )

    if (!isValid) {
      console.error('eSewa signature verification failed')
      return { success: false, message: 'Invalid payment signature' }
    }

    // Verify with eSewa status API
    const statusRes = await axios.get(
      'https://uat.esewa.com.np/api/epay/transaction/status/',
      {
        params: {
          product_code:     product_code,
          total_amount:     total_amount,
          transaction_uuid: transaction_uuid,
        },
        timeout: 10000,
      }
    )

    if (statusRes.data.status !== 'COMPLETE') {
      return { success: false, message: 'eSewa status check failed' }
    }

    return processPaymentOrder(transaction_uuid, 'ESEWA', transaction_uuid)
  } catch (err: any) {
    console.error('eSewa callback error:', err.message)
    return { success: false, message: 'Payment processing error' }
  }
}

// ═══════════════════════════════════════════
// ORDER PROCESSOR
// Routes payment to the right handler based on order type
// ═══════════════════════════════════════════

const processPaymentOrder = async (
  orderId:       string,
  method:        string,
  transactionId: string | null
): Promise<{ success: boolean; message: string; type?: string }> => {

  // Idempotency — check if this order was already processed
  const existingPurchase = await prisma.creditPurchase.findFirst({
    where: {
      OR: [
        { paymentRef: transactionId ?? orderId },
        { id:         orderId },
      ],
      status: 'COMPLETED',
    },
  })

  if (existingPurchase) {
    return { success: true, message: 'Already processed', type: 'credit_purchase' }
  }

  // Try to find a pending credit purchase with this orderId
  const creditPurchase = await prisma.creditPurchase.findFirst({
    where: {
      OR: [
        { id:         orderId },
        { paymentRef: orderId },
      ],
      status: 'PENDING',
    },
    include: { pack: true },
  })

  if (creditPurchase) {
    // Complete the credit purchase
    await prisma.$transaction([
      prisma.creditPurchase.update({
        where: { id: creditPurchase.id },
        data:  { status: 'COMPLETED', paymentRef: transactionId ?? orderId },
      }),
      prisma.creditWallet.update({
        where: { providerId: creditPurchase.providerId },
        data: {
          balance:     { increment: creditPurchase.pack.credits },
          totalEarned: { increment: creditPurchase.pack.credits },
        },
      }),
    ])

    console.log(
      `✅ Credit purchase completed: +${creditPurchase.pack.credits} credits ` +
      `for provider ${creditPurchase.providerId}`
    )

    return { success: true, message: `${creditPurchase.pack.credits} credits added`, type: 'credit_purchase' }
  }

  // Future: handle badge purchases, booking deposits, etc.
  console.warn(`⚠️  No matching order found for orderId: ${orderId}`)
  return { success: false, message: 'Order not found' }
}

// ── Initiate credit pack purchase ─────────────────────────────

export const initiateCreditPurchase = async (params: {
  providerId:    string
  packId:        string
  paymentMethod: 'KHALTI' | 'ESEWA'
  returnUrl:     string
}) => {
  const { providerId, packId, paymentMethod, returnUrl } = params

  const pack = await prisma.creditPack.findUnique({
    where: { id: packId, isActive: true },
  })

  if (!pack) {
    throw { code: 'PACK_NOT_FOUND', message: 'Credit pack not found', status: 404 }
  }

  // Create pending purchase record first (orderId = purchase.id)
  const purchase = await prisma.creditPurchase.create({
    data: {
      providerId,
      packId,
      creditsAdded:  pack.credits,
      amountNpr:     pack.priceNpr,
      paymentMethod,
      status:        'PENDING',
    },
  })

  if (paymentMethod === 'KHALTI') {
    const { paymentUrl, pidx } = await initiateKhaltiPayment({
      amount:    pack.priceNpr,
      orderId:   purchase.id,
      orderName: `BishwasSetu ${pack.name} credit pack`,
      returnUrl,
    })

    // Store pidx for verification
    await prisma.creditPurchase.update({
      where: { id: purchase.id },
      data:  { paymentRef: pidx },
    })

    return { paymentUrl, orderId: purchase.id, method: 'KHALTI' }
  }

  // eSewa: return the payment form data
  const esewaParams = {
    amount:           pack.priceNpr,
    tax_amount:       0,
    total_amount:     pack.priceNpr,
    transaction_uuid: purchase.id,
    product_code:     process.env.ESEWA_PRODUCT_CODE,
    product_service_charge: 0,
    product_delivery_charge: 0,
    success_url:      returnUrl,
    failure_url:      `${process.env.CLIENT_URL}/credits/failed`,
    signed_field_names: 'total_amount,transaction_uuid,product_code',
  }

  // Generate eSewa signature
  const message = `total_amount=${esewaParams.total_amount},transaction_uuid=${esewaParams.transaction_uuid},product_code=${esewaParams.product_code}`
  const hmac    = crypto.createHmac('sha256', process.env.ESEWA_SECRET_KEY!)
  hmac.update(message)
  const signature = hmac.digest('base64')

  return {
    esewaUrl:    'https://uat.esewa.com.np/api/epay/main/v2/form',
    esewaParams: { ...esewaParams, signature },
    orderId:     purchase.id,
    method:      'ESEWA',
  }
}