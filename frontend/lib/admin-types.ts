// Admin response shapes (backend/src/services/adminService.ts)

export interface AdminDashboard {
  users: { total: number; newThisWeek: number };
  providers: {
    total: number;
    verified: number;
    pendingKycReview: number;
    avgTrustScore: number;
  };
  bookings: { total: number; completed: number; thisMonth: number };
  complaints: { open: number; critical: number };
  revenue: {
    totalCommissionNpr: number;
    monthlyCommissionNpr: number;
    monthlyBookings: number;
  };
}

export interface KycAiDecision {
  confidence?: number | null;
  faceScore?: number | null;
  forgeryRisk?: number | null;
  decision?: string | null;
  ocrResult?: unknown;
}

export interface KycQueueItem {
  id: string;
  legalName: string;
  serviceArea?: string | null;
  yearsExperience?: number | null;
  kycTier: string;
  updatedAt: string;
  user?: { name: string; email?: string | null; phone?: string | null };
  documents?: { type: string; uploadedAt: string }[];
  kycDecisions?: KycAiDecision[];
}

export interface KycQueueResponse {
  queue: KycQueueItem[];
  total: number;
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface AdminKycDocument {
  id: string;
  type: string;
  signedUrl: string;
  uploadedAt: string;
}
