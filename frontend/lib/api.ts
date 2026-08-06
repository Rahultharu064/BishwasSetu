// Thin API client for the BishwasSetu backend (Express, /api/v1).
// - Bearer access token kept in memory + localStorage
// - Refresh token lives in an HttpOnly cookie (credentials: 'include')
// - Unwraps the { success, message, data } envelope; throws ApiError on failure.

import type { ApiEnvelope, EscrowStatus } from "./types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

const TOKEN_KEY = "bs_access_token";

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== "undefined") {
    accessToken = localStorage.getItem(TOKEN_KEY);
  }
  return accessToken;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  auth?: boolean;
  signal?: AbortSignal;
  /** Skip the automatic refresh-and-retry on 401. */
  noRetry?: boolean;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(
    API_BASE + (path.startsWith("/") ? path : `/${path}`)
  );
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "")
        url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function refreshToken(): Promise<boolean> {
  try {
    const res = await fetch(buildUrl("/auth/refresh"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return false;
    const json = (await res.json()) as ApiEnvelope<{ accessToken: string }>;
    if (json.success && json.data?.accessToken) {
      setAccessToken(json.data.accessToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export interface SystemHealth {
  status: string;
  timestamp: string;
  uptime: number;
  env: string;
}

/** GET /health — outside the /api/v1 prefix and not envelope-wrapped, unlike everything else here. */
export async function fetchSystemHealth(): Promise<SystemHealth> {
  const base = API_BASE.replace(/\/api\/v1\/?$/, "");
  const res = await fetch(`${base}/health`);
  if (!res.ok) throw new ApiError("Health check failed.", "HEALTH_CHECK_FAILED", res.status);
  return res.json() as Promise<SystemHealth>;
}

export async function apiRequest<T>(
  path: string,
  opts: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, query, auth = false, signal, noRetry } = opts;

  const headers: Record<string, string> = {};
  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const token = auth ? getAccessToken() : null;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: payload,
      credentials: "include",
      signal,
    });
  } catch {
    throw new ApiError(
      "Can't reach the server. Check your connection and try again.",
      "NETWORK_ERROR",
      0
    );
  }

  // Attempt a single silent refresh + retry on expired token.
  if (res.status === 401 && auth && !noRetry) {
    const refreshed = await refreshToken();
    if (refreshed) {
      return apiRequest<T>(path, { ...opts, noRetry: true });
    }
    setAccessToken(null);
  }

  let json: ApiEnvelope<T> | null = null;
  try {
    json = (await res.json()) as ApiEnvelope<T>;
  } catch {
    if (!res.ok)
      throw new ApiError("Something went wrong.", "SERVER_ERROR", res.status);
    return undefined as T;
  }

  if (!res.ok || !json.success) {
    throw new ApiError(
      json?.error?.message || json?.message || "Request failed",
      json?.error?.code || "REQUEST_FAILED",
      res.status
    );
  }

  return json.data;
}

// ── Endpoint helpers ──────────────────────────────────────────

export const api = {
  // Auth
  register: (body: {
    name: string;
    email?: string;
    phone?: string;
    password: string;
    role: "CUSTOMER" | "PROVIDER";
    city?: string;
    district?: string;
    latitude?: number;
    longitude?: number;
  }) => apiRequest<{ userId: string }>("/auth/register", { method: "POST", body }),

  login: (body: { email?: string; phone?: string; password: string }) =>
    apiRequest<{ userId: string }>("/auth/login", { method: "POST", body }),

  verifyOtp: (body: { userId: string; code: string }) =>
    apiRequest<{ accessToken: string; user: import("./types").User }>(
      "/auth/verify-otp",
      { method: "POST", body }
    ),

  resendOtp: (body: { userId: string }) =>
    apiRequest<null>("/auth/resend-otp", { method: "POST", body }),

  logout: () => apiRequest<null>("/auth/logout", { method: "POST" }),

  // Staff login — separate endpoint from the public auth/* flow above (no
  // registration, no OTP step; see backend routes/adminAuthRoute.ts).
  adminLogin: (body: { email: string; password: string }) =>
    apiRequest<{ accessToken: string; user: import("./types").User }>(
      "/admin-auth/login",
      { method: "POST", body }
    ),
  adminUpdateProfile: (body: { name: string }) =>
    apiRequest<{ id: string; name: string; role: string }>("/admin-auth/me", {
      method: "PATCH",
      body,
      auth: true,
    }),
  adminChangePassword: (body: { currentPassword: string; newPassword: string }) =>
    apiRequest<{ message: string }>("/admin-auth/change-password", {
      method: "PATCH",
      body,
      auth: true,
    }),
  systemHealth: fetchSystemHealth,

  // Services / categories
  categories: () => apiRequest<import("./types").Category[]>("/services"),
  categoryBySlug: (slug: string) =>
    apiRequest<import("./types").Category>(`/services/${slug}`),
  providersByCategory: (
    slug: string,
    query?: Record<string, string | number | undefined>
  ) => apiRequest<unknown>(`/services/${slug}/providers`, { query }),
  searchServices: (q: string) =>
    apiRequest<unknown>("/services/search", { query: { q } }),

  // Services / categories — admin management (full tree incl. inactive rows)
  adminServiceTree: () =>
    apiRequest<import("./admin-types").AdminCategoryRow[]>(
      "/services/admin/tree",
      { auth: true }
    ),
  adminCreateCategory: (body: {
    name: string;
    nameNp: string;
    slug: string;
    icon?: string;
    description?: string;
    descriptionNp?: string;
    sortOrder?: number;
  }) => apiRequest<unknown>("/services", { method: "POST", body, auth: true }),
  adminUpdateCategory: (
    id: string,
    body: Partial<{
      name: string;
      nameNp: string;
      slug: string;
      icon: string;
      description: string;
      descriptionNp: string;
      sortOrder: number;
    }>
  ) =>
    apiRequest<unknown>(`/services/${id}`, { method: "PUT", body, auth: true }),
  adminToggleCategory: (id: string, isActive: boolean) =>
    apiRequest<unknown>(`/services/${id}/toggle`, {
      method: "PATCH",
      body: { isActive },
      auth: true,
    }),
  adminCreateSubCategory: (body: {
    categoryId: string;
    name: string;
    nameNp: string;
    slug: string;
    description?: string;
    descriptionNp?: string;
    sortOrder?: number;
  }) =>
    apiRequest<unknown>("/services/sub", { method: "POST", body, auth: true }),
  adminUpdateSubCategory: (
    id: string,
    body: Partial<{
      name: string;
      nameNp: string;
      slug: string;
      description: string;
      descriptionNp: string;
      sortOrder: number;
    }>
  ) =>
    apiRequest<unknown>(`/services/sub/${id}`, {
      method: "PUT",
      body,
      auth: true,
    }),
  adminToggleSubCategory: (id: string, isActive: boolean) =>
    apiRequest<unknown>(`/services/sub/${id}/toggle`, {
      method: "PATCH",
      body: { isActive },
      auth: true,
    }),
  adminCreateService: (body: {
    subCategoryId: string;
    name: string;
    nameNp: string;
    slug: string;
    description?: string;
    descriptionNp?: string;
    pricingType: "fixed" | "range" | "quote";
    priceMin?: number;
    priceMax?: number;
    priceFixed?: number;
    priceUnit?: string;
    estimatedMinutes?: number;
    sortOrder?: number;
  }) =>
    apiRequest<unknown>("/services/service", {
      method: "POST",
      body,
      auth: true,
    }),
  adminUpdateService: (
    id: string,
    body: Partial<{
      name: string;
      nameNp: string;
      slug: string;
      description: string;
      descriptionNp: string;
      pricingType: "fixed" | "range" | "quote";
      priceMin: number;
      priceMax: number;
      priceFixed: number;
      priceUnit: string;
      estimatedMinutes: number;
      sortOrder: number;
    }>
  ) =>
    apiRequest<unknown>(`/services/service/${id}`, {
      method: "PUT",
      body,
      auth: true,
    }),
  adminToggleService: (id: string, isActive: boolean) =>
    apiRequest<unknown>(`/services/service/${id}/toggle`, {
      method: "PATCH",
      body: { isActive },
      auth: true,
    }),

  // AI Smart Match — nearest providers for a category (customer, auth)
  smartMatch: (body: {
    categoryId?: string;
    category?: string;
    description?: string;
    city?: string;
    district?: string;
    latitude?: number;
    longitude?: number;
  }) =>
    apiRequest<import("./types").SmartMatchResult>("/match", {
      method: "POST",
      body,
      auth: true,
    }),

  // Providers
  searchProviders: (query?: Record<string, string | number | undefined>) =>
    apiRequest<unknown>("/providers", { query }),
  providerById: (id: string) =>
    apiRequest<import("./types").Provider>(`/providers/${id}`),

  // Bookings (customer)
  createBooking: (body: unknown) =>
    apiRequest<import("./types").Booking>("/bookings", {
      method: "POST",
      body,
      auth: true,
    }),
  myCustomerBookings: () =>
    apiRequest<import("./types").Booking[]>("/bookings/customer/me", {
      auth: true,
    }),
  bookingById: (id: string) =>
    apiRequest<import("./types").Booking>(`/bookings/${id}`, { auth: true }),
  updateBookingStatus: (id: string, status: string, cancelReason?: string) =>
    apiRequest<import("./types").Booking>(`/bookings/${id}/status`, {
      method: "PUT",
      body: cancelReason ? { status, cancelReason } : { status },
      auth: true,
    }),

  // Bookings (provider) — GET /bookings/provider/me
  providerBookings: (query?: Record<string, string | number | undefined>) =>
    apiRequest<import("./types").ProviderBookingsResponse>(
      "/bookings/provider/me",
      { query, auth: true }
    ),

  // Reviews
  providerReviews: (providerId: string) =>
    apiRequest<import("./types").Review[]>(`/reviews/provider/${providerId}`),
  createReview: (body: { bookingId: string; rating: number; comment?: string }) =>
    apiRequest<import("./types").Review>("/reviews", {
      method: "POST",
      body,
      auth: true,
    }),

  // Complaints
  createComplaint: (body: {
    bookingId: string;
    type: string;
    description: string;
  }) =>
    apiRequest<{ id: string }>("/complaints", {
      method: "POST",
      body,
      auth: true,
    }),
  myComplaints: () =>
    apiRequest<unknown>("/complaints/me", { auth: true }),
  complaintById: (id: string) =>
    apiRequest<import("./types").Complaint>(`/complaints/${id}`, { auth: true }),

  // Credits / boost (provider)
  creditPacks: () => apiRequest<unknown>("/credits/packs", { auth: true }),
  creditWallet: () => apiRequest<unknown>("/credits/wallet", { auth: true }),
  creditHistory: () => apiRequest<unknown>("/credits/history", { auth: true }),
  initiateCreditPurchase: (body: {
    packId: string;
    paymentMethod: "KHALTI" | "ESEWA";
    returnUrl: string;
  }) =>
    apiRequest<{
      orderId: string;
      method: "KHALTI" | "ESEWA";
      paymentUrl?: string;
      /** eSewa only — ePay v2 requires a signed POST form submit, not a GET redirect. */
      esewaUrl?: string;
      esewaParams?: Record<string, string>;
    }>("/payments/initiate", { method: "POST", body, auth: true }),

  // KYC (provider)
  kycStatus: () =>
    apiRequest<import("./types").KycStatus>("/kyc/status", { auth: true }),
  uploadKyc: (form: FormData) =>
    apiRequest<unknown>("/kyc/upload", { method: "POST", body: form, auth: true }),
  submitSkillEvidence: (form: FormData) =>
    apiRequest<{ status: string; message: string }>("/kyc/skill-evidence", {
      method: "POST",
      body: form,
      auth: true,
    }),

  // Admin
  adminDashboard: () => apiRequest<unknown>("/admin/dashboard", { auth: true }),
  adminBookingsTrend: (days = 14) =>
    apiRequest<import("./admin-types").BookingTrendPoint[]>(
      "/admin/analytics/bookings-trend",
      { query: { days }, auth: true }
    ),
  adminKycQueue: (query?: Record<string, string | number | undefined>) =>
    apiRequest<unknown>("/admin/kyc", { query, auth: true }),
  adminKycDocuments: (providerId: string) =>
    apiRequest<unknown[]>(`/kyc/admin/${providerId}/documents`, { auth: true }),
  adminApproveKyc: (id: string) =>
    apiRequest<unknown>(`/admin/kyc/${id}/approve`, { method: "PUT", auth: true }),
  adminRejectKyc: (id: string, reason: string) =>
    apiRequest<unknown>(`/admin/kyc/${id}/reject`, {
      method: "PUT",
      body: { reason },
      auth: true,
    }),
  adminRequestInfoKyc: (id: string, reason: string) =>
    apiRequest<unknown>(`/admin/kyc/${id}/request-info`, {
      method: "PUT",
      body: { reason },
      auth: true,
    }),
  adminBlacklistKyc: (id: string) =>
    apiRequest<unknown>(`/admin/kyc/${id}/blacklist`, {
      method: "PUT",
      auth: true,
    }),
  adminProviders: (query?: Record<string, string | number | undefined>) =>
    apiRequest<unknown>("/admin/providers", { query, auth: true }),
  adminComplaints: (query?: Record<string, string | number | undefined>) =>
    apiRequest<unknown>("/admin/complaints", { query, auth: true }),
  adminResolveComplaint: (
    id: string,
    body: { resolution: string; action: string }
  ) =>
    apiRequest<{ action: string; refundIssued: boolean; message: string }>(
      `/admin/complaints/${id}/resolve`,
      {
        method: "PUT",
        body,
        auth: true,
      }
    ),

  // Admin — user management
  adminUsers: (query?: Record<string, string | number | undefined>) =>
    apiRequest<unknown>("/admin/users", { query, auth: true }),
  adminToggleUserStatus: (id: string, isActive: boolean) =>
    apiRequest<unknown>(`/admin/users/${id}/status`, {
      method: "PATCH",
      body: { isActive },
      auth: true,
    }),

  // Admin — skill evidence queue (v2.3, human-reviewed)
  adminSkillEvidence: (query?: Record<string, string | number | undefined>) =>
    apiRequest<unknown>("/admin/skill-evidence", { query, auth: true }),
  adminApproveSkillEvidence: (id: string) =>
    apiRequest<unknown>(`/admin/skill-evidence/${id}/approve`, {
      method: "PUT",
      auth: true,
    }),
  adminRejectSkillEvidence: (id: string, reason: string) =>
    apiRequest<unknown>(`/admin/skill-evidence/${id}/reject`, {
      method: "PUT",
      body: { reason },
      auth: true,
    }),

  // Admin — trust & fraud
  adminTrustAnomalies: () =>
    apiRequest<unknown>("/admin/trust/anomalies", { auth: true }),
  adminFraudFlags: (query?: Record<string, string | number | undefined>) =>
    apiRequest<unknown>("/admin/fraud/flags", { query, auth: true }),
  adminResolveFraudFlag: (id: string) =>
    apiRequest<unknown>(`/admin/fraud/flags/${id}/resolve`, {
      method: "PATCH",
      auth: true,
    }),

  // Admin — revenue analytics
  adminRevenue: (query: { from: string; to: string }) =>
    apiRequest<unknown>("/admin/analytics/revenue", { query, auth: true }),

  // ── §5.1 Escrow ──────────────────────────────────────────────
  initiateEscrow: (body: {
    bookingId: string;
    gateway: "KHALTI" | "ESEWA";
    returnUrl: string;
  }) =>
    apiRequest<{
      escrowId: string;
      paymentUrl: string;
      gatewayRef: string;
      /** eSewa only — ePay v2 requires a signed POST form submit, not a GET redirect. */
      formFields?: Record<string, string>;
    }>("/escrow/initiate", { method: "POST", body, auth: true }),

  verifyEscrow: (body: { escrowId: string; pidx?: string; data?: string }) =>
    apiRequest<{ id: string; status: EscrowStatus }>("/escrow/verify", {
      method: "POST",
      body,
      auth: true,
    }),

  releaseEscrow: (escrowId: string, gps?: { latitude: number; longitude: number }) =>
    apiRequest<unknown>(`/escrow/${escrowId}/release`, {
      method: "POST",
      body: gps ?? {},
      auth: true,
    }),

  getEscrow: (escrowId: string) =>
    apiRequest<{
      id: string;
      status: string;
      amountPaisa: number;
      payoutPaisa: number;
      commissionPaisa: number;
      guarantee?: { id: string; status: string; expiresAt: string } | null;
    }>(`/escrow/${escrowId}`, { auth: true }),

  // ── §5.2 Guarantee ───────────────────────────────────────────
  myGuarantees: () =>
    apiRequest<
      {
        id: string;
        status: string;
        expiresAt: string;
        escrow: { bookingId: string; amountPaisa: number };
        claims: unknown[];
      }[]
    >("/guarantees", { auth: true }),

  fileGuaranteeClaim: (guaranteeId: string, form: FormData) =>
    apiRequest<{ id: string }>(`/guarantees/${guaranteeId}/claims`, {
      method: "POST",
      body: form,
      auth: true,
    }),

  // ── §5.3 Emergency ───────────────────────────────────────────
  createEmergency: (body: {
    category: string;
    description?: string;
    latitude: number;
    longitude: number;
    addressLabel?: string;
  }) =>
    apiRequest<{ id: string; status: string; expiresAt: string }>(
      "/emergency",
      { method: "POST", body, auth: true }
    ),

  getEmergencyStatus: (requestId: string) =>
    apiRequest<{
      id: string;
      status: string;
      category: string;
      acceptedById?: string | null;
      bookingId?: string | null;
      offers: { providerId: string; distanceKm: number; status: string }[];
    }>(`/emergency/${requestId}`, { auth: true }),

  cancelEmergency: (requestId: string) =>
    apiRequest<unknown>(`/emergency/${requestId}/cancel`, {
      method: "POST",
      auth: true,
    }),

  // Provider emergency inbox — GET /emergency/offers/me
  providerEmergencyOffers: () =>
    apiRequest<{ offers: import("./types").EmergencyOffer[] }>(
      "/emergency/offers/me",
      { auth: true }
    ),
  acceptEmergency: (requestId: string) =>
    apiRequest<{ id: string }>(`/emergency/${requestId}/accept`, {
      method: "POST",
      auth: true,
    }),
  declineEmergency: (requestId: string) =>
    apiRequest<unknown>(`/emergency/${requestId}/decline`, {
      method: "POST",
      auth: true,
    }),

  // ── §5.4 Neighborhood ────────────────────────────────────────
  neighborhoodStats: (providerId: string) =>
    apiRequest<
      { areaName: string; city: string; jobsThisMonth: number; jobsAllTime: number }[]
    >(`/providers/${providerId}/neighborhood-stats`),

  // ── §4.3 Trust Badges ────────────────────────────────────────
  badgeCatalog: () =>
    apiRequest<import("./types").BadgeCatalogItem[]>("/badges/catalog", {
      auth: true,
    }),
  myBadges: () =>
    apiRequest<import("./types").ProviderBadgeRecord[]>("/badges/me", {
      auth: true,
    }),
  uploadBadgeDocument: (form: FormData) =>
    apiRequest<{ documentUrl: string; documentId: string; fileType: string }>(
      "/badges/document",
      { method: "POST", body: form, auth: true }
    ),
  purchaseBadge: (body: {
    badgeType: import("./types").PurchasableBadgeType;
    paymentMethod: "KHALTI" | "ESEWA";
    paymentRef: string;
    documentUrl?: string;
    documentId?: string;
  }) =>
    apiRequest<{ badge: import("./types").ProviderBadgeRecord; message: string }>(
      "/badges/purchase",
      { method: "POST", body, auth: true }
    ),
  // Admin badge queue
  adminPendingBadges: (query?: Record<string, string | number | undefined>) =>
    apiRequest<{
      badges: import("./types").PendingBadge[];
      pagination: import("./types").Pagination;
    }>("/badges/admin/pending", { query, auth: true }),
  adminVerifyBadge: (id: string) =>
    apiRequest<unknown>(`/badges/admin/${id}/verify`, {
      method: "PUT",
      auth: true,
    }),
  adminRejectBadge: (id: string, reason: string) =>
    apiRequest<unknown>(`/badges/admin/${id}/reject`, {
      method: "PUT",
      body: { reason },
      auth: true,
    }),

  // ── In-booking messaging ─────────────────────────────────────
  conversations: () =>
    apiRequest<{ conversations: import("./types").Conversation[] }>(
      "/messages/conversations",
      { auth: true }
    ),
  messageThread: (bookingId: string) =>
    apiRequest<import("./types").ChatThread>(`/messages/${bookingId}`, {
      auth: true,
    }),
  postMessage: (bookingId: string, body: string) =>
    apiRequest<import("./types").ChatMessage>(`/messages/${bookingId}`, {
      method: "POST",
      body: { body },
      auth: true,
    }),

  // ── Saved addresses ──────────────────────────────────────────
  addresses: () =>
    apiRequest<{ addresses: import("./types").SavedAddress[] }>("/addresses", {
      auth: true,
    }),
  createAddress: (body: import("./types").AddressInput) =>
    apiRequest<import("./types").SavedAddress>("/addresses", {
      method: "POST",
      body,
      auth: true,
    }),
  updateAddress: (
    id: string,
    body: Partial<import("./types").AddressInput>
  ) =>
    apiRequest<import("./types").SavedAddress>(`/addresses/${id}`, {
      method: "PATCH",
      body,
      auth: true,
    }),
  setDefaultAddress: (id: string) =>
    apiRequest<import("./types").SavedAddress>(`/addresses/${id}/default`, {
      method: "PATCH",
      auth: true,
    }),
  deleteAddress: (id: string) =>
    apiRequest<{ id: string }>(`/addresses/${id}`, {
      method: "DELETE",
      auth: true,
    }),

  // ── Payment preference ───────────────────────────────────────
  getPaymentPreference: () =>
    apiRequest<{
      preferredPaymentMethod: "KHALTI" | "ESEWA" | "CASH" | null;
    }>("/users/me/payment-preference", { auth: true }),
  updatePaymentPreference: (
    preferredPaymentMethod: "KHALTI" | "ESEWA" | "CASH"
  ) =>
    apiRequest<{
      preferredPaymentMethod: "KHALTI" | "ESEWA" | "CASH" | null;
    }>("/users/me/payment-preference", {
      method: "PATCH",
      body: { preferredPaymentMethod },
      auth: true,
    }),
};

// ── Assistant SSE streaming (POST /assistant/chat) ────────────

/** Retrieval metadata sent once, before tokens stream (backend `meta` event). */
export interface ChatStreamMeta {
  intent: string;
  lang: "ne" | "en";
  /** KB articles the answer is grounded in — surface these as citations. */
  sources: { title: string; category: string }[];
}

export interface ChatStreamHandlers {
  /** Fires once with retrieval intent/language and the KB sources used. */
  onMeta?: (meta: ChatStreamMeta) => void;
  onToken: (text: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
}

export async function streamAssistantChat(
  body: {
    message: string;
    sessionId: string;
    contextType?: "booking" | "provider" | "complaint" | "credits" | "general";
    contextId?: string;
    /** Site's EN/NE toggle — fallback language when the message itself is ambiguous. */
    uiLang?: "ne" | "en";
  },
  handlers: ChatStreamHandlers,
  signal?: AbortSignal
): Promise<void> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "text/event-stream",
  };
  const token = getAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(buildUrl("/assistant/chat"), {
      method: "POST",
      headers,
      body: JSON.stringify({ contextType: "general", ...body }),
      credentials: "include",
      signal,
    });
  } catch {
    handlers.onError("Weak connection — please try again.");
    return;
  }

  if (!res.ok || !res.body) {
    handlers.onError("The assistant is unavailable right now.");
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by a blank line
      const frames = buffer.split("\n\n");
      buffer = frames.pop() ?? "";
      for (const frame of frames) {
        const line = frame.split("\n").find((l) => l.startsWith("data:"));
        if (!line) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const evt = JSON.parse(payload) as {
            type: string;
            content?: string;
            message?: string;
            intent?: string;
            lang?: "ne" | "en";
            sources?: { title: string; category: string }[];
          };
          if (evt.type === "token" && evt.content) handlers.onToken(evt.content);
          else if (evt.type === "done") handlers.onDone();
          else if (evt.type === "meta")
            handlers.onMeta?.({
              intent: evt.intent ?? "general",
              lang: evt.lang ?? "en",
              sources: evt.sources ?? [],
            });
          else if (evt.type === "error")
            handlers.onError(evt.message ?? "Assistant error.");
        } catch {
          /* ignore malformed frame */
        }
      }
    }
    handlers.onDone();
  } catch {
    handlers.onError("Connection dropped mid-answer.");
  }
}

/** Thumbs up/down on a specific assistant answer, tied to the KB sources shown alongside it. */
export async function sendAssistantFeedback(body: {
  sessionId: string;
  messageIndex: number;
  rating: "up" | "down";
  sources?: { title: string; category: string }[];
  comment?: string;
}): Promise<void> {
  await apiRequest("/assistant/feedback", { method: "POST", body, auth: true });
}
