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

// ── Pagination (shared envelope) ──────────────────────────────
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── User management (GET /admin/users) ────────────────────────
export interface AdminUser {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  provider?: {
    identityStatus?: string | null;
    skillStatus?: string | null;
    milestoneBadge?: string | null;
    trustScore?: number | null;
  } | null;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  pagination: Pagination;
}

// ── Skill-evidence queue (GET /admin/skill-evidence) ──────────
export interface SkillEvidenceItem {
  id: string;
  type: string; // 'certificate' | 'work_photo' | 'reference'
  fileUrl: string;
  certNumber?: string | null;
  issuerName?: string | null;
  aiPrecheck?: {
    documentType?: string;
    duplicateFlag?: boolean;
    stockPhotoFlag?: boolean;
    aiGeneratedFlag?: boolean;
  } | null;
  reviewStatus: string; // PENDING | APPROVED | REJECTED
  authenticityTier: string; // NONE | TIER_1 | TIER_2
  isPaidBadge: boolean;
  rejectReason?: string | null;
  createdAt: string;
  provider: {
    id: string;
    legalName: string;
    trustScore?: number | null;
    identityStatus?: string | null;
    skillStatus?: string | null;
    user?: { name: string; phone?: string | null } | null;
  };
}

export interface SkillEvidenceResponse {
  evidence: SkillEvidenceItem[];
  pagination: Pagination;
}

// ── Trust anomalies (GET /admin/trust/anomalies) ──────────────
export interface TrustAnomaly {
  id: string;
  providerId: string;
  score: number;
  prevScore: number;
  trigger: string;
  aiFlags?: unknown;
  createdAt: string;
  provider: {
    id: string;
    legalName: string;
    trustScore?: number | null;
    identityStatus?: string | null;
    skillStatus?: string | null;
    milestoneBadge?: string | null;
  };
}

// ── Fraud flags (GET /admin/fraud/flags) ──────────────────────
export interface FraudFlag {
  id: string;
  entityType: string; // review | complaint | profile
  entityId: string;
  result: string; // FLAGGED | REVIEWED
  category?: string | null;
  confidence: number;
  createdAt: string;
}

export interface FraudFlagsResponse {
  flags: FraudFlag[];
  pagination: Pagination;
}

// ── Revenue analytics (GET /admin/analytics/revenue) ──────────
export interface RevenueAnalytics {
  period: { from: string; to: string };
  streams: {
    commission: { totalNpr: number; bookingsCount: number };
    credits: { totalNpr: number; purchasesCount: number };
    badges: { totalNpr: number; badgesCount: number };
  };
  totalRevenueNpr: number;
}
