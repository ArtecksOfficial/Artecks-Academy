"use client";
// Client-side GET for the iOS pages (page.ios.tsx), which can't fetch on a
// server. Returns { data, error, loading }; data is null on 404 or failure.
import { useEffect, useState } from "react";

export function useApiJson<T>(path: string | null) {
  const [state, setState] = useState<{ data: T | null; error: boolean; loading: boolean }>({
    data: null,
    error: false,
    loading: path !== null,
  });

  useEffect(() => {
    if (path === null) {
      setState({ data: null, error: false, loading: false });
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    fetch(path, { cache: "no-store" })
      .then(async (res) => {
        const data = res.ok ? ((await res.json()) as T) : null;
        if (!cancelled) setState({ data, error: !res.ok && res.status !== 404, loading: false });
      })
      .catch(() => {
        if (!cancelled) setState({ data: null, error: true, loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  return state;
}
