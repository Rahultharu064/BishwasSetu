/**
 * Shared types for Section 5 — Anti-Disintermediation features.
 */

export type Gateway = "KHALTI" | "ESEWA";

export interface InitiateEscrowInput {
  bookingId: string;
  gateway: Gateway;
  returnUrl: string; // frontend URL the gateway redirects back to
}

export interface GatewayInitiateResult {
  /** URL the customer must be redirected to complete payment */
  paymentUrl: string;
  /** Gateway-side reference (Khalti pidx / eSewa transaction_uuid) */
  gatewayRef: string;
}

export interface GatewayVerifyResult {
  verified: boolean;
  gatewayTxnId?: string;
  amountPaisa?: number;
}

export interface EmergencyRequestInput {
  category: string;
  description?: string;
  latitude: number;
  longitude: number;
  addressLabel?: string;
}

export interface ProviderCandidate {
  providerId: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  fcmToken?: string | null;
  phone?: string | null;
}

export interface NeighborhoodStat {
  areaName: string;
  city: string;
  jobsThisMonth: number;
  jobsAllTime: number;
}

/** Payload for the Bull dispatch job */
export interface DispatchJobPayload {
  requestId: string;
}

/** Payload for the Bull escrow-release side effects job */
export interface EscrowReleasedJobPayload {
  escrowId: string;
}
