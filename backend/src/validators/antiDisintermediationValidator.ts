import { z } from "zod";

// ---------- 5.1 Escrow ----------

export const initiateEscrowSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1),
    gateway: z.enum(["KHALTI", "ESEWA"]),
    returnUrl: z.string().url(),
  }),
});

export const verifyEscrowSchema = z.object({
  body: z.object({
    escrowId: z.string().min(1),
    // Khalti sends pidx back; eSewa sends a base64 `data` payload
    pidx: z.string().optional(),
    data: z.string().optional(),
  }),
});

export const escrowIdParamSchema = z.object({
  params: z.object({ escrowId: z.string().min(1) }),
});

export const releaseEscrowSchema = z.object({
  params: z.object({ escrowId: z.string().min(1) }),
  body: z.object({
    // GPS captured at "Job Complete" tap — powers §5.4 neighborhood tags
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
  }),
});

export const refundEscrowSchema = z.object({
  params: z.object({ escrowId: z.string().min(1) }),
  body: z.object({ reason: z.string().min(5).max(500) }),
});

// ---------- 5.2 Guarantee ----------

export const fileClaimSchema = z.object({
  params: z.object({ guaranteeId: z.string().min(1) }),
  body: z.object({
    description: z.string().min(10).max(2000),
  }),
});

export const resolveClaimSchema = z.object({
  params: z.object({ claimId: z.string().min(1) }),
  body: z.object({ resolution: z.string().min(5).max(2000) }),
});

// ---------- 5.3 Emergency Dispatch ----------

export const createEmergencySchema = z.object({
  body: z.object({
    category: z.string().min(2).max(50),
    description: z.string().max(1000).optional(),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    addressLabel: z.string().max(200).optional(),
  }),
});

export const emergencyIdParamSchema = z.object({
  params: z.object({ requestId: z.string().min(1) }),
});

// ---------- 5.4 Neighborhood ----------

export const providerIdParamSchema = z.object({
  params: z.object({ providerId: z.string().min(1) }),
});

export const createAreaSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    city: z.string().min(2).max(100),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    radiusKm: z.coerce.number().min(0.2).max(10).default(1.5),
  }),
});
