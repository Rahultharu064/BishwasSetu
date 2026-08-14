import { z } from "zod";

export const UpdatePaymentPreferenceSchema = z.object({
  preferredPaymentMethod: z.enum(["KHALTI", "ESEWA", "CASH"]),
});

export type UpdatePaymentPreferenceInput = z.infer<
  typeof UpdatePaymentPreferenceSchema
>;

// Deliberately just `name` — email/phone double as sign-in credentials, so
// changing them here would need the same re-verification rigor as the
// registration flow. Same scope decision as adminAuthValidator's own version.
export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
