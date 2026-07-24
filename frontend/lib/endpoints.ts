import { api, toQuery } from "@/lib/api";
import type {
  AuthUser,
  Category,
  ProviderProfile,
  ProviderSummary,
  Booking,
  Review,
  KycStatusResponse,
  KycDocumentMeta,
  ProviderDashboard,
  AdminKycQueueItem,
} from "@/lib/types";

// ── Auth ──────────────────────────────────────────────────────

export const AuthApi = {
  register: (input: {
    name: string;
    email?: string;
    phone?: string;
    password: string;
    role: "CUSTOMER" | "PROVIDER";
  }) => api.post<{ userId: string; message: string }>("/auth/register", input),

  login: (input: { email?: string; phone?: string; password: string }) =>
    api.post<{ userId: string; message: string }>("/auth/login", input),

  verifyOtp: (input: { userId: string; code: string }) =>
    api.post<{ accessToken: string; user: AuthUser }>("/auth/verify-otp", input),

  resendOtp: (userId: string) => api.post<{ message: string }>("/auth/resend-otp", { userId }),

  logout: () => api.post<null>("/auth/logout"),
};

// ── Services / Categories ────────────────────────────────────

export const ServiceApi = {
  categories: () => api.get<Category[]>("/services"),
  category: (slug: string) => api.get("/services/" + slug),
};

// ── Providers ─────────────────────────────────────────────────

export const ProviderApi = {
  search: (params: { q?: string; category?: string; serviceArea?: string; page?: number; limit?: number }) =>
    api.get<{ providers: ProviderSummary[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(
      "/providers" + toQuery(params)
    ),

  publicProfile: (id: string) => api.get<ProviderProfile>(`/providers/${id}`),

  providersByCategory: (
    slug: string,
    params: { serviceArea?: string; page?: number; limit?: number }
  ) =>
    api.get<{
      category: Category;
      providers: ProviderSummary[];
      marketStats: {
        priceMin: number;
        priceMax: number;
        priceAvg: number;
        totalBookings: number;
        avgTrustScore: number;
        totalProviders: number;
      };
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>(`/services/${slug}/providers` + toQuery(params)),

  me: () => api.get("/providers/me"),
  completeProfile: (input: unknown) => api.post("/providers/me/complete", input),
  dashboard: () => api.get<ProviderDashboard>("/providers/me/dashboard"),
  uploadPhoto: (form: FormData) => api.postForm("/providers/me/photo", form),
};

// ── Bookings ──────────────────────────────────────────────────

export const BookingApi = {
  create: (input: {
    providerId: string;
    categoryId: string;
    description: string;
    scheduledAt: string;
    priceNpr: number;
    paymentMethod: "KHALTI" | "ESEWA" | "CASH";
    isEmergency?: boolean;
    neighborhood?: string;
  }) => api.post<Booking>("/bookings", input),

  myCustomerBookings: (params: { status?: string; page?: number; limit?: number }) =>
    api.get<{ bookings: Booking[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(
      "/bookings/customer/me" + toQuery(params)
    ),

  myProviderBookings: (params: { status?: string; page?: number; limit?: number }) =>
    api.get<{ bookings: Booking[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(
      "/bookings/provider/me" + toQuery(params)
    ),

  get: (id: string) => api.get<Booking>(`/bookings/${id}`),

  updateStatus: (id: string, input: { status: string; cancelReason?: string }) =>
    api.put<{ message: string; booking: Booking }>(`/bookings/${id}/status`, input),

  pay: (id: string, input: { paymentMethod: "KHALTI" | "ESEWA"; returnUrl: string }) =>
    api.post<{ paymentUrl?: string; esewaUrl?: string; esewaParams?: Record<string, string> }>(
      `/bookings/${id}/pay`,
      input
    ),
};

// ── Reviews ───────────────────────────────────────────────────

export const ReviewApi = {
  forProvider: (providerId: string, params: { page?: number; limit?: number }) =>
    api.get<{ reviews: Review[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(
      `/reviews/provider/${providerId}` + toQuery(params)
    ),

  create: (input: { bookingId: string; rating: number; comment?: string }) =>
    api.post<Review>("/reviews", input),
};

// ── KYC ───────────────────────────────────────────────────────

export const KycApi = {
  status: () => api.get<KycStatusResponse>("/kyc/status"),
  upload: (form: FormData) => api.postForm<{ status: string; message: string }>("/kyc/upload", form),
  adminDocuments: (providerId: string) =>
    api.get<(KycDocumentMeta & { signedUrl: string })[]>(`/kyc/admin/${providerId}/documents`),
};

// ── Admin ─────────────────────────────────────────────────────

export interface AdminDashboardSummary {
  users: { total: number; newThisWeek: number };
  providers: { total: number; verified: number; pendingKycReview: number; avgTrustScore: number };
  bookings: { total: number; completed: number; thisMonth: number };
  complaints: { open: number; critical: number };
  revenue: { totalCommissionNpr: number; monthlyCommissionNpr: number; monthlyBookings: number };
}

export const AdminApi = {
  dashboard: () => api.get<AdminDashboardSummary>("/admin/dashboard"),
  kycQueue: (params: { page?: number; limit?: number }) =>
    api.get<{ queue: AdminKycQueueItem[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(
      "/admin/kyc" + toQuery(params)
    ),
  approveKyc: (id: string) => api.put<{ message: string }>(`/admin/kyc/${id}/approve`),
  rejectKyc: (id: string, reason: string) => api.put<{ message: string }>(`/admin/kyc/${id}/reject`, { reason }),
};
