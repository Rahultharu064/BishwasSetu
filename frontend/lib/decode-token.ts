interface AccessTokenPayload {
  id: string;
  role: "CUSTOMER" | "PROVIDER" | "MODERATOR" | "ADMIN";
  providerId?: string;
}

export function decodeAccessToken(token: string): AccessTokenPayload | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}
