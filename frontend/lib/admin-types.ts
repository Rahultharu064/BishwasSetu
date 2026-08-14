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
  // Backend stores this as a categorical risk level, not a 0-1 score —
  // see backend/src/kyc/kycForgery.ts (ForgeryRisk type).
  forgeryRisk?: "low" | "medium" | "high" | null;
  decision?: string | null;
  ocrResult?: unknown;
  // The *why* behind the scores — specific issues found, plus each check's
  // own one-line reasoning.
  flags?: string[] | null;
  faceReasoning?: string | null;
  forgeryReasoning?: string | null;
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

// ── Audit log (GET /admin/audit-log) ───────────────────────────
export interface AuditLogEntry {
  id: string;
  adminId: string;
  action: string;
  targetType: "complaint" | "provider" | "user" | "fraudFlag" | "skillEvidence";
  targetId: string;
  details?: Record<string, unknown> | null;
  createdAt: string;
  admin?: { name: string; role: string } | null;
}

export interface AuditLogResponse {
  logs: AuditLogEntry[];
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

// ── Bookings trend (GET /admin/analytics/bookings-trend) ──────
export interface BookingTrendPoint {
  date: string; // YYYY-MM-DD
  total: number;
  completed: number;
}

// ── Service catalog management (GET /services/admin/tree) ─────
// Distinct names from lib/types.ts's public Category/Service — this is the
// admin CRUD shape (includes inactive rows + nested sub-categories/services
// in one call), not the public catalog shape.
export interface AdminServiceRow {
  id: string;
  subCategoryId: string;
  name: string;
  nameNp: string;
  description?: string | null;
  descriptionNp?: string | null;
  slug: string;
  pricingType: "fixed" | "range" | "quote";
  priceMin?: number | null;
  priceMax?: number | null;
  priceFixed?: number | null;
  priceUnit?: string | null;
  estimatedMinutes?: number | null;
  isActive: boolean;
  sortOrder: number;
}

export interface AdminSubCategoryRow {
  id: string;
  categoryId: string;
  name: string;
  nameNp: string;
  description?: string | null;
  descriptionNp?: string | null;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  services: AdminServiceRow[];
  _count: { services: number };
}

export interface AdminCategoryRow {
  id: string;
  name: string;
  nameNp: string;
  icon?: string | null;
  description?: string | null;
  descriptionNp?: string | null;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  subCategories: AdminSubCategoryRow[];
  _count: { providers: number };
}
