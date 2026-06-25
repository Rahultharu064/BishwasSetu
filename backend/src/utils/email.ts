export const sendEmail = async (
  to:      string,
  subject: string,
  text:    string
): Promise<void> => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`\n📧 [DEV EMAIL]\n   To: ${to}\n   Subject: ${subject}\n   Body: ${text}\n`)
    return
  }

  // TODO: wire Nodemailer / SendGrid here
  console.warn('Email service not configured for production')
}