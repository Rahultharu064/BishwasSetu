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
