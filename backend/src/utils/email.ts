import { Resend } from "resend";

// Nodemailer/Gmail SMTP was swapped for Resend — Gmail app-password SMTP
// hits deliverability and rate-limit walls in production; Resend is a
// transactional email API built for exactly this (OTP/auth mail).
const FROM_ADDRESS = process.env.EMAIL_FROM ?? "BishwasSetu <onboarding@resend.dev>";

let client: Resend | null | undefined;

/** Lazily built so a missing RESEND_API_KEY doesn't crash boot — only email-sending is affected. */
function getClient(): Resend | null {
  if (client !== undefined) return client;
  const apiKey = process.env.RESEND_API_KEY;
  client = apiKey ? new Resend(apiKey) : null;
  return client;
}

// ── Branded HTML shell ──────────────────────────────────────────
// Inline styles only — email clients strip <style> blocks and external CSS.

function baseTemplate(bodyHtml: string): string {
  return `<div style="background:#f1f1ec;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e7e7e1;">
    <tr>
      <td style="background:#0e7c5b;padding:20px 28px;">
        <span style="color:#ffffff;font-size:18px;font-weight:700;">Bishwas<span style="color:#bfe3d4;">Setu</span></span>
      </td>
    </tr>
    <tr>
      <td style="padding:28px;">
        ${bodyHtml}
      </td>
    </tr>
    <tr>
      <td style="padding:16px 28px;border-top:1px solid #e7e7e1;">
        <p style="margin:0;font-size:12px;line-height:1.5;color:#6b7280;">
          BishwasSetu — verified home services in Nepal. If you didn't request this, you can safely ignore this email.
        </p>
      </td>
    </tr>
  </table>
</div>`;
}

function otpTemplate(opts: {
  heading: string;
  intro:   string;
  code:    string;
  expiresMinutes: string | number;
}): string {
  return baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:20px;color:#1a1d1c;">${opts.heading}</h1>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#1a1d1c;">${opts.intro}</p>
    <div style="text-align:center;margin:0 0 20px;">
      <span style="display:inline-block;padding:14px 28px;border-radius:12px;background:#e3f2ec;font-size:32px;font-weight:700;letter-spacing:8px;color:#0e7c5b;">${opts.code}</span>
    </div>
    <p style="margin:0;font-size:13px;line-height:1.5;color:#6b7280;">
      This code expires in ${opts.expiresMinutes} minutes. Never share it with anyone — BishwasSetu staff will never ask for it.
    </p>`);
}

// ── Generic email ────────────────────────────────────────────────

export const sendEmail = async (
  to:      string,
  subject: string,
  text:    string,
  html?:   string
): Promise<void> => {
  if (process.env.NODE_ENV === "development") {
    console.log(`\n📧 [DEV EMAIL]\n   To: ${to}\n   Subject: ${subject}\n   Body: ${text}\n`);
    return;
  }

  const resend = getClient();
  if (!resend) {
    console.warn("Email service not configured — set RESEND_API_KEY");
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      text,
      html: html ?? baseTemplate(`<p style="margin:0;font-size:14px;line-height:1.6;color:#1a1d1c;">${text.replace(/\n/g, "<br/>")}</p>`),
    });
    if (error) console.error("Failed to send email:", error);
  } catch (err) {
    // Best-effort — OTP flows already have SMS as the primary channel;
    // a failed email shouldn't block registration/login.
    console.error("Failed to send email:", err);
  }
};

// ── OTP email — branded template, used by register/login/resend ──

export const sendOtpEmail = async (
  to:             string,
  code:           string,
  expiresMinutes: string | number,
  context:        "register" | "login" | "resend" = "login"
): Promise<void> => {
  const subject =
    context === "register" ? "Verify your BishwasSetu account" : "Your BishwasSetu verification code";
  const heading = context === "register" ? "Welcome to BishwasSetu" : "Your verification code";
  const intro =
    context === "register"
      ? "Use the code below to verify your account and finish setting up."
      : "Use the code below to finish signing in.";

  const text = `${intro}\n\nYour code: ${code}\nThis code expires in ${expiresMinutes} minutes.\n\nIf you didn't request this, you can safely ignore this email.`;
  const html = otpTemplate({ heading, intro, code, expiresMinutes });

  await sendEmail(to, subject, text, html);
};
