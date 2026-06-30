import { z } from 'zod'

const PricingTypeEnum = z.enum(['fixed', 'range', 'quote'])

export const CreateCategorySchema = z.object({
  name:          z.string().min(2).max(100).trim(),
  nameNp:        z.string().min(2).max(100).trim(),
  icon:          z.string().max(100).optional(),
  description:   z.string().max(1000).optional(),
  descriptionNp: z.string().max(1000).optional(),
  slug:          z.string().min(2).max(100).toLowerCase().trim(),
  sortOrder:     z.coerce.number().default(0),
})

export const CreateSubCategorySchema = z.object({
  categoryId:    z.string().uuid(),
  name:          z.string().min(2).max(100).trim(),
  nameNp:        z.string().min(2).max(100).trim(),
  description:   z.string().max(1000).optional(),
  descriptionNp: z.string().max(1000).optional(),
  slug:          z.string().min(2).max(100).toLowerCase().trim(),
  sortOrder:     z.coerce.number().default(0),
})

export const CreateServiceSchema = z.object({
  subCategoryId:    z.string().uuid(),
  name:             z.string().min(2).max(200).trim(),
  nameNp:           z.string().min(2).max(200).trim(),
  description:      z.string().max(2000).optional(),
  descriptionNp:    z.string().max(2000).optional(),
  slug:             z.string().min(2).max(100).toLowerCase().trim(),
  pricingType:      PricingTypeEnum,
  priceMin:         z.coerce.number().min(0).optional(),
  priceMax:         z.coerce.number().min(0).optional(),
  priceFixed:       z.coerce.number().min(0).optional(),
  priceUnit:        z.string().max(30).optional(),
  estimatedMinutes: z.coerce.number().min(0).optional(),
  includedTasks:    z.array(z.string()).optional(),
  excludedTasks:    z.array(z.string()).optional(),
  sortOrder:        z.coerce.number().default(0),
}).refine((d) => {
  if (d.pricingType === 'fixed'  && !d.priceFixed)            return false
  if (d.pricingType === 'range'  && (!d.priceMin || !d.priceMax)) return false
  return true
}, { message: 'Provide priceFixed for fixed pricing, or priceMin+priceMax for range' })

export type CreateCategoryInput    = z.infer<typeof CreateCategorySchema>
export type CreateSubCategoryInput = z.infer<typeof CreateSubCategorySchema>
export type CreateServiceInput     = z.infer<typeof CreateServiceSchema>