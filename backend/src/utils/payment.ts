import axios from 'axios'

// ── Khalti payment verification ───────────────────────────────

export const verifyKhaltiPayment = async (
  pidx:      string,
  amountNpr: number
): Promise<{ verified: boolean; transactionId: string | null }> => {
  try {
    const response = await axios.post(
      'https://a.khalti.com/api/v2/epayment/lookup/',
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    )

    const data = response.data
    const verified =
      data.status === 'Completed' &&
      Math.round(data.total_amount / 100) === amountNpr  // Khalti uses paisa

    return {
      verified,
      transactionId: data.transaction_id ?? null,
    }
  } catch {
    return { verified: false, transactionId: null }
  }
}

// ── eSewa payment verification ────────────────────────────────

export const verifyEsewaPayment = async (
  refId:     string,
  amountNpr: number,
  orderId:   string
): Promise<{ verified: boolean; transactionId: string | null }> => {
  try {
    const response = await axios.get(
      'https://uat.esewa.com.np/api/epay/transaction/status/',
      {
        params: {
          product_code:         process.env.ESEWA_PRODUCT_CODE,
          total_amount:         amountNpr,
          transaction_uuid:     orderId,
        },
        timeout: 10000,
      }
    )

    const data     = response.data
    const verified = data.status === 'COMPLETE'

    return {
      verified,
      transactionId: data.ref_id ?? refId,
    }
  } catch {
    return { verified: false, transactionId: null }
  }
}