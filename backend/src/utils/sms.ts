import axios from 'axios'

export const sendSms = async (phone: string, message: string): Promise<void> => {
  if (process.env.NODE_ENV === 'development') {
    // In dev, just log the OTP — don't burn SMS credits
    console.log(`\n📱 [DEV SMS] To: ${phone}\n   Message: ${message}\n`)
    return
  }

  try {
    await axios.post(
      'http://api.sparrowsms.com/v2/sms/',
      {
        token:  process.env.SPARROW_SMS_TOKEN!,
        from:   process.env.SPARROW_SMS_FROM!,
        to:     phone,
        text:   message,
      },
      { timeout: 5000 }
    )
  } catch (error) {
    // SMS failure should not crash the request — log and continue
    console.error('SMS send failed:', error)
  }
}