export type Role = "CUSTOMER" | "PROVIDER" | "MODERATOR" | "ADMIN";

export type IdentityStatus =
  | "INCOMPLETE"
  | "PENDING_DOCUMENTS"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "REJECTED";

export type BookingStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

export type EscrowStatus = "NONE" | "PENDING" | "HELD" | "RELEASED" | "REFUNDED" | "DISPUTED";

export interface AuthUser {
  id: string;
  name: string;
  role: Role;
  providerId?: string;
  kycStatus?: IdentityStatus;
}

export interface Category {
  id: string;
  name: string;
  nameNp: string;
  icon?: string | null;
  description?: string | null;
  slug: string;
  _count?: { subCategories: number; providers: number };
}

export interface ProviderCategoryLink {
  category: Category;
}

export interface ProviderSummary {
  id: string;
  legalName: string;
  bio?: string | null;
  serviceArea?: string | null;
  profilePhoto?: string | null;
  trustScore: number;
  identityStatus: IdentityStatus;
  milestoneBadge: string;
  completedBookings: number;
  totalRevenue?: number;
  yearsExperience?: number | null;
  user?: { name: string };
  skills?: { skill: string }[];
  categories?: ProviderCategoryLink[];
  badges?: { badgeType: string }[];
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  reply?: string | null;
  createdAt: string;
  customer?: { name: string };
}

export interface ProviderProfile {
  provider: ProviderSummary & {
    availability?: { dayOfWeek: number; startTime: string; endTime: string }[];
    reviews?: Review[];
    experienceBadge?: string;
  };
  trustBreakdown: Record<string, number> | null;
  neighborhoodStats: { neighborhood: string | null; homesHelped: number }[];
}

export interface Booking {
  id: string;
  status: BookingStatus;
  description: string;
  scheduledAt: string;
  priceNpr: number;
  commission?: number | null;
  escrowStatus: EscrowStatus;
  paymentMethod?: "KHALTI" | "ESEWA" | "CASH" | null;
  isEmergency: boolean;
  neighborhood?: string | null;
  cancelReason?: string | null;
  createdAt: string;
  completedAt?: string | null;
  provider?: { id: string; legalName: string; profilePhoto?: string | null };
  customer?: { id?: string; name: string };
  category?: { id: string; name: string };
}

export interface PaginatedResult<T> {
  providers?: T[];
  bookings?: T[];
  data?: T[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface KycDocumentMeta {
  type: string;
  uploadedAt: string;
  signedUrl?: string;
  id?: string;
  providerId?: string;
}

export interface KycStatusResponse {
  identityStatus: IdentityStatus;
  skillStatus: string;
  identityRejectionReason?: string | null;
  skillRejectionReason?: string | null;
  documents: KycDocumentMeta[];
  aiDecision: { confidence: number; forgeryRisk: string; decision: string } | null;
}

export interface ProviderDashboard {
  provider: ProviderSummary & { createdAt: string };
  stats: {
    requested: number;
    accepted: number;
    inProgress: number;
    completed: number;
    rejected: number;
  };
  earnings: { totalRevenue: number; totalCommission: number; totalEarnings: number };
  recentBookings: Booking[];
  creditBalance: number;
  experienceBadge: string;
}

export interface AdminKycQueueItem {
  id: string;
  legalName: string;
  identityStatus: IdentityStatus;
  createdAt: string;
  updatedAt: string;
  serviceArea?: string | null;
  user?: { name: string; email?: string; phone?: string };
  documents: { type: string; uploadedAt: string }[];
  kycDecisions: { confidence: number; faceScore: number; forgeryRisk: string; decision: string }[];
}
