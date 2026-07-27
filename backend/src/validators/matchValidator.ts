import { z } from 'zod'

/**
 * Smart Match request. Location is optional here because it falls back to the
 * customer's saved profile location — but at least one of {coords, district,
 * city, profile location} must resolve, which the service enforces.
 */
export const SmartMatchSchema = z
  .object({
    categoryId: z.string().uuid().optional(),
    category: z.string().min(1).max(100).trim().optional(), // slug or name
    description: z.string().max(1000).trim().optional(),
    city: z.string().min(1).max(80).trim().optional(),
    district: z.string().min(1).max(80).trim().optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
  })
  .refine((d) => d.categoryId || d.category, {
    message: 'Provide a category (categoryId or category slug)',
    path: ['category'],
  })
  .refine((d) => (d.latitude == null) === (d.longitude == null), {
    message: 'latitude and longitude must be provided together',
    path: ['latitude'],
  })

export type SmartMatchInput = z.infer<typeof SmartMatchSchema>
