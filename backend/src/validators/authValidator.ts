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
}).refine((data) => data.email || data.phone, {
  message: 'Provide either email or phone number',
  path:    ['email'],
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

export type RegisterInput  = z.infer<typeof RegisterSchema>
export type LoginInput     = z.infer<typeof LoginSchema>
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>