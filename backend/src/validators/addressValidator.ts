import { z } from "zod";

export const CreateAddressSchema = z.object({
  label: z.string().trim().min(1).max(40),
  addressLine: z.string().trim().min(4).max(300),
  city: z.string().trim().max(100).optional(),
  landmark: z.string().trim().max(200).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  isDefault: z.boolean().optional(),
});

// All fields optional on update, but at least one must be present.
export const UpdateAddressSchema = CreateAddressSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Provide at least one field to update" }
);

export type CreateAddressInput = z.infer<typeof CreateAddressSchema>;
export type UpdateAddressInput = z.infer<typeof UpdateAddressSchema>;
