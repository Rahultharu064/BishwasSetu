import { z } from 'zod'

export const KycStatusQuerySchema = z.object({
  providerId: z.string().uuid(),
})