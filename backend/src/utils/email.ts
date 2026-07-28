import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null | undefined;

/** Lazily built so a missing EMAIL_USER/EMAIL_PASS doesn't crash boot — only email-sending is affected. */
function getTransporter(): nodemailer.Transporter | null {
  if (transporter !== undefined) return transporter;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  transporter = user && pass
    ? nodemailer.createTransport({ service: "gmail", auth: { user, pass } })
    : null;
  return transporter;
}

export const sendEmail = async (
  to:      string,
  subject: string,
  text:    string
): Promise<void> => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`\n📧 [DEV EMAIL]\n   To: ${to}\n   Subject: ${subject}\n   Body: ${text}\n`)
    return
  }

  const t = getTransporter();
  if (!t) {
    console.warn('Email service not configured — set EMAIL_USER/EMAIL_PASS')
    return
  }

  try {
    await t.sendMail({
      from: `"BishwasSetu" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
  } catch (err) {
    // Best-effort — OTP flows already have SMS as the primary channel;
    // a failed email shouldn't block registration/login.
    console.error('Failed to send email:', err);
  }
}
