import { z } from 'zod'

// Admin/moderator accounts are provisioned directly in the database — no
// public registration, no phone-based signup — so login only needs email +
// password (matches how every ADMIN/MODERATOR row is actually created).
export const AdminLoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

export type AdminLoginInput = z.infer<typeof AdminLoginSchema>

export const AdminUpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim(),
})

export type AdminUpdateProfileInput = z.infer<typeof AdminUpdateProfileSchema>

export const AdminChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8).max(72),
})

export type AdminChangePasswordInput = z.infer<typeof AdminChangePasswordSchema>
