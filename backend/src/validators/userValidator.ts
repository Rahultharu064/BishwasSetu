import { z } from "zod";

export const UpdatePaymentPreferenceSchema = z.object({
  preferredPaymentMethod: z.enum(["KHALTI", "ESEWA", "CASH"]),
});

export type UpdatePaymentPreferenceInput = z.infer<
  typeof UpdatePaymentPreferenceSchema
>;
