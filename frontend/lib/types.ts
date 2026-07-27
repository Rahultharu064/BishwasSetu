// Shared domain types — mirror backend Prisma models (backend/prisma/schema.prisma)

export type Role = "CUSTOMER" | "PROVIDER" | "MODERATOR" | "ADMIN";

export type KycTier = "TIER_1_BASIC" | "TIER_2_SKILLED" | "TIER_3_VERIFIED";

export type IdentityStatus =
  | "INCOMPLETE"
  | "PENDING_DOCUMENTS"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "REJECTED";

export type SkillStatus =
  | "UNVERIFIED"
  | "SELF_DECLARED"
  | "PENDING_REVIEW"
  | "VERIFIED";

export type MilestoneBadge =
  | "NEW"
  | "ESTABLISHED"
  | "TRUSTED_PRO"
  | "MASTER_PROVIDER";

export type BookingStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

export type EscrowStatus =
  | "NONE"
  | "PENDING"
  | "HELD"
  | "RELEASED"
  | "REFUNDED"
  | "DISPUTED";

export interface User {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: Role;
  city?: string | null;
  district?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

// ── AI Smart Match (POST /match) ──────────────────────────────
export type BusinessTier = "PRIORITY" | "MEMBER" | "NONE";

export interface SmartMatchProvider {
  id: string;
  legalName: string;
  profilePhoto?: string | null;
  bio?: string | null;
  trustScore: number;
  completedBookings: number;
  milestoneBadge: MilestoneBadge;
  kycTier: KycTier;
  city?: string | null;
  serviceArea?: string | null;
  distanceKm: number | null;
  businessTier: BusinessTier;
  isPriorityPartner: boolean;
  skills: string[];
  categories: string[];
  rank: number;
  aiReason?: string | null;
}

export interface SmartMatchResult {
  match: {
    location: {
      city: string | null;
      district: string | null;
      hasCoords: boolean;
      radiusKm: number;
    };
    category: { id: string; name: string; slug: string };
    aiEnabled: boolean;
    topPickId: string | null;
    aiReason: string | null;
    count: number;
  };
  providers: SmartMatchProvider[];
}

export interface Category {
  id: string;
  name: string;
  nameNp: string;
  icon?: string | null;
  description?: string | null;
  slug: string;
  isActive?: boolean;
  _count?: { subCategories?: number; providers?: number };
}

export interface Service {
  id: string;
  name: string;
  nameNp: string;
  description?: string | null;
  slug: string;
  pricingType: "fixed" | "range" | "quote";
  priceMin?: number | null;
  priceMax?: number | null;
  priceFixed?: number | null;
  priceUnit?: string | null;
  estimatedMinutes?: number | null;
}

export interface Provider {
  id: string;
  userId?: string;
  legalName: string;
  profilePhoto?: string | null;
  bio?: string | null;
  serviceArea?: string | null;
  yearsExperience?: number | null;
  identityStatus: IdentityStatus;
  skillStatus: SkillStatus;
  milestoneBadge: MilestoneBadge;
  kycTier: KycTier;
  completedBookings: number;
  trustScore: number;
  isAvailable: boolean;
  user?: { name: string };
  categories?: { category: Category }[];
  reviews?: Review[];
  _count?: { reviews?: number };
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  customer?: { name: string };
}

export interface Booking {
  id: string;
  status: BookingStatus;
  escrowStatus: EscrowStatus;
  scheduledAt?: string | null;
  address?: string | null;
  notes?: string | null;
  amount?: number | null;
  createdAt: string;
  provider?: Provider;
  category?: Category;
  service?: Service;
  /** Present on provider-facing booking lists. */
  customer?: { id: string; name: string } | null;
  review?: { rating: number } | null;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** GET /bookings/provider/me */
export interface ProviderBookingsResponse {
  bookings: Booking[];
  pagination: Pagination;
}

// ── KYC status (GET /kyc/status) — reuses IdentityStatus/SkillStatus above ──
export interface KycStatus {
  identityStatus: IdentityStatus;
  skillStatus: SkillStatus;
  identityRejectionReason?: string | null;
  skillRejectionReason?: string | null;
  documents: { type: string; uploadedAt: string }[];
  aiDecision?: {
    confidence?: number | null;
    forgeryRisk?: number | null;
    decision?: string | null;
    adminOverride?: boolean | null;
  } | null;
}

export type ComplaintType =
  | "SERVICE_QUALITY"
  | "NO_SHOW"
  | "OVERCHARGING"
  | "ABUSIVE_BEHAVIOR"
  | "FRAUD";

export type ComplaintStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";

export interface Complaint {
  id: string;
  type: ComplaintType;
  status: ComplaintStatus;
  description: string;
  aiCategory?: string | null;
  resolution?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  bookingId?: string;
  provider?: { legalName: string; trustScore?: number };
  customer?: { name: string; phone?: string | null };
  booking?: {
    scheduledAt?: string | null;
    category?: { name: string } | null;
  };
}

/** GET /emergency/offers/me — a live dispatch offer shown to a provider. */
export interface EmergencyOffer {
  offerId: string;
  requestId: string;
  distanceKm: number;
  sentAt: string;
  category: string;
  description?: string | null;
  addressLabel?: string | null;
  latitude: number;
  longitude: number;
  commissionPct: number;
  expiresAt: string;
  createdAt: string;
}

// ── In-booking messaging ──────────────────────────────────────
export interface ChatParty {
  name: string;
  photo?: string | null;
  providerId?: string | null;
}

export interface ChatMessage {
  id: string;
  body: string;
  createdAt: string;
  mine: boolean;
  readAt?: string | null;
}

export interface Conversation {
  bookingId: string;
  category?: string | null;
  status: BookingStatus;
  other: ChatParty;
  lastMessage?: { body: string; createdAt: string; mine: boolean } | null;
  unread: number;
}

export interface ChatThread {
  bookingId: string;
  status: BookingStatus;
  canSend: boolean;
  other: ChatParty;
  messages: ChatMessage[];
}

// ── Saved addresses ───────────────────────────────────────────
export interface SavedAddress {
  id: string;
  label: string;
  addressLine: string;
  city?: string | null;
  landmark?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  isDefault: boolean;
  createdAt: string;
}

export interface AddressInput {
  label: string;
  addressLine: string;
  city?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  error?: { code: string; message: string; status: number };
}

export interface Paginated<T> {
  items?: T[];
  data?: T[];
  results?: T[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
