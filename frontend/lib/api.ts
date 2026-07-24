// Thin API client for the BishwasSetu backend (Express, /api/v1).
// - Bearer access token kept in memory + localStorage
// - Refresh token lives in an HttpOnly cookie (credentials: 'include')
// - Unwraps the { success, message, data } envelope; throws ApiError on failure.

import type { ApiEnvelope } from "./types";

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
  updateBookingStatus: (id: string, status: string) =>
    apiRequest<import("./types").Booking>(`/bookings/${id}/status`, {
      method: "PUT",
      body: { status },
      auth: true,
    }),

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
  purchaseCredits: (body: { packId: string; paymentMethod: string }) =>
    apiRequest<unknown>("/credits/purchase", { method: "POST", body, auth: true }),

  // KYC (provider)
  kycStatus: () => apiRequest<unknown>("/kyc/status", { auth: true }),
  uploadKyc: (form: FormData) =>
    apiRequest<unknown>("/kyc/upload", { method: "POST", body: form, auth: true }),

  // Admin
  adminDashboard: () => apiRequest<unknown>("/admin/dashboard", { auth: true }),
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
    apiRequest<unknown>(`/admin/complaints/${id}/resolve`, {
      method: "PUT",
      body,
      auth: true,
    }),
};

// ── Assistant SSE streaming (POST /assistant/chat) ────────────
export interface ChatStreamHandlers {
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
          };
          if (evt.type === "token" && evt.content) handlers.onToken(evt.content);
          else if (evt.type === "done") handlers.onDone();
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
