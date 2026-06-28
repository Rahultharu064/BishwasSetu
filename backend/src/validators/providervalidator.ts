import { z } from 'zod'

export const CompleteProfileSchema = z.object({
  legalName:      z.string().min(2).max(100).trim(),
  bio:            z.string().max(1000).optional(),
  serviceArea:    z.string().min(2).max(100).trim(),
  experienceYears: z.coerce.number().min(0).max(50),
  skills:         z.array(z.string().min(1).max(100)).min(1).max(20),
  categoryIds:    z.array(z.string().uuid()).min(1).max(5),
  availability:   z.array(
    z.object({
      dayOfWeek: z.number().min(0).max(6),
      startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format: HH:MM'),
      endTime:   z.string().regex(/^\d{2}:\d{2}$/, 'Format: HH:MM'),
    })
  ).min(1),
})

export const UpdateProviderSchema = CompleteProfileSchema.partial()

export type CompleteProfileInput = z.infer<typeof CompleteProfileSchema>
export type UpdateProviderInput  = z.infer<typeof UpdateProviderSchema>