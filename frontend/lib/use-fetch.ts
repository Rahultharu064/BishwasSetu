"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "./api";

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Small client-side fetch hook with loading/error and manual reload.
 * Pass `pollMs` to silently refresh in the background (no skeleton flash) —
 * `enabled` gates whether polling runs (e.g. only while a booking is active).
 */
export function useFetch<T>(
  fn: () => Promise<T>,
  deps: unknown[] = [],
  poll?: { pollMs: number; enabled: boolean }
): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fn()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.message : "Something went wrong."
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  // Background polling — updates data in place without toggling `loading`.
  useEffect(() => {
    if (!poll?.enabled || !poll.pollMs) return;
    let cancelled = false;
    const id = setInterval(() => {
      fn()
        .then((res) => !cancelled && setData(res))
        .catch(() => {
          /* keep last good data on a transient poll failure */
        });
    }, poll.pollMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poll?.enabled, poll?.pollMs, ...deps]);

  return { data, loading, error, reload };
}
