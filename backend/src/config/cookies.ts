import type { CookieOptions } from 'express'

/**
 * Refresh-token cookie options.
 *
 * The frontend (Vercel) and this API (Render) sit on different registrable
 * domains, so the refresh cookie is cross-site. Browsers only send a cross-site
 * cookie when it is `SameSite=None; Secure` — with `strict` or `lax` it is
 * silently dropped on every request from the frontend, so /auth/refresh always
 * sees "no token" and the user is logged out the moment the access token expires.
 *
 * `SameSite=None` is only accepted alongside `Secure`, so both are keyed off the
 * same flag: NODE_ENV must be `production` on the API host. In development both
 * ends are on localhost (same site, plain http), where `lax` + non-secure works
 * and `none` would be rejected for lack of TLS.
 *
 * Trade-off: SameSite=None means the cookie rides along on cross-site requests,
 * so it can't be relied on as CSRF protection. That's acceptable here because
 * it only authorizes /auth/refresh — every other endpoint authenticates off the
 * Bearer access token, which a cross-site attacker cannot read or set.
 */
const isProd = process.env.NODE_ENV === 'production'

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure:   isProd,
  sameSite: isProd ? 'none' : 'lax',
  path:     '/',
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
}

/**
 * clearCookie() only matches the cookie when the flags line up (maxAge aside),
 * so logout has to mirror the options the cookie was set with.
 */
export const clearRefreshCookieOptions: CookieOptions = {
  httpOnly: refreshCookieOptions.httpOnly,
  secure:   refreshCookieOptions.secure,
  sameSite: refreshCookieOptions.sameSite,
  path:     refreshCookieOptions.path,
}
