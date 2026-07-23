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
};
