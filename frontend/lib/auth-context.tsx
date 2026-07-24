"use client";

import * as React from "react";
import { setAccessToken, refreshAccessToken } from "@/lib/api";
import { AuthApi } from "@/lib/endpoints";
import { decodeAccessToken } from "@/lib/decode-token";
import type { AuthUser } from "@/lib/types";

interface AuthContextValue {
  user: AuthUser | null;
  bootstrapping: boolean;
  setSession: (accessToken: string, user: AuthUser) => void;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<AuthUser>) => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [bootstrapping, setBootstrapping] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await refreshAccessToken();
      if (cancelled) return;
      if (token) {
        const payload = decodeAccessToken(token);
        if (payload) {
          setUser((prev) => ({
            id: payload.id,
            role: payload.role,
            providerId: payload.providerId,
            name: prev?.name ?? "",
          }));
        }
      }
      setBootstrapping(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setSession = React.useCallback((accessToken: string, nextUser: AuthUser) => {
    setAccessToken(accessToken);
    setUser(nextUser);
  }, []);

  const updateUser = React.useCallback((patch: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await AuthApi.logout();
    } catch {
      // best-effort
    }
    setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, bootstrapping, setSession, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
