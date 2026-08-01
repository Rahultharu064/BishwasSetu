import { z } from 'zod'

export const RegisterSchema = z.object({
  name:     z.string().min(2).max(100).trim(),
  email:    z.string().email().optional(),
  phone:    z
    .string()
    .regex(/^(\+977)?[9][6-9]\d{8}$/, 'Invalid Nepal phone number')
    .optional(),
  password: z.string().min(8).max(100),
  role:     z.enum(['CUSTOMER', 'PROVIDER']).default('CUSTOMER'),
  // Service location (used for nearest-provider matching). District + city are
  // the primary signals; lat/long, when the browser can share them, sharpen
  // the ranking. All optional at signup, refinable later from the profile.
  city:      z.string().min(1).max(80).trim().optional(),
  district:  z.string().min(1).max(80).trim().optional(),
  latitude:  z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
}).refine((data) => data.email || data.phone, {
  message: 'Provide either email or phone number',
  path:    ['email'],
}).refine((data) => (data.latitude == null) === (data.longitude == null), {
  message: 'latitude and longitude must be provided together',
  path:    ['latitude'],
})

export const LoginSchema = z.object({
  email:    z.string().email().optional(),
  phone:    z.string().optional(),
  password: z.string().min(1),
}).refine((data) => data.email || data.phone, {
  message: 'Provide either email or phone',
  path:    ['email'],
})

export const VerifyOtpSchema = z.object({
  userId: z.string().uuid(),
  code:   z.string().length(6).regex(/^\d{6}$/, 'OTP must be 6 digits'),
})

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
})

export type RegisterInput     = z.infer<typeof RegisterSchema>
export type LoginInput        = z.infer<typeof LoginSchema>
export type VerifyOtpInput    = z.infer<typeof VerifyOtpSchema>