"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, getAccessToken, setAccessToken } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  setSession: (accessToken: string, user: User) => void;
  logout: () => Promise<void>;
}

const USER_KEY = "bs_user";

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount — localStorage doesn't exist during
  // SSR/first render, so this can only happen client-side, after mount.
  useEffect(() => {
    try {
      const token = getAccessToken();
      const raw =
        typeof window !== "undefined" ? localStorage.getItem(USER_KEY) : null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (token && raw) setUser(JSON.parse(raw) as User);
    } catch {
      /* ignore corrupt storage */
    } finally {
      setLoading(false);
    }
  }, []);

  const setSession = useCallback((accessToken: string, nextUser: User) => {
    setAccessToken(accessToken);
    setUser(nextUser);
    if (typeof window !== "undefined")
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      /* best-effort */
    }
    setAccessToken(null);
    setUser(null);
    if (typeof window !== "undefined") localStorage.removeItem(USER_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        setSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
