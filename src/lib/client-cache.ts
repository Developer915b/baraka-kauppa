// Tiny client-side memory cache for storefront JSON reads.
//
// Why: navigating between pages (home -> shop -> product -> shop) used to
// refetch the same product data every time. With this cache each filter key
// is fetched at most once per TTL window, so navigation feels instant and
// the number of API (and therefore database) calls drops.
//
// Realtime safety: entries live only for a short TTL (matching the API's CDN
// window), and `useCachedJson` revalidates when the browser tab regains
// focus, so changes the shop owner makes appear within seconds of the
// visitor looking at the site again.

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Entry = { data: unknown; at: number };

const globalForClientCache = globalThis as unknown as {
  bkClientCache: Map<string, Entry> | undefined;
};

function store(): Map<string, Entry> {
  if (!globalForClientCache.bkClientCache) globalForClientCache.bkClientCache = new Map();
  return globalForClientCache.bkClientCache;
}

export function getCachedJson<T>(key: string, ttlMs: number): T | undefined {
  const hit = store().get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.data as T;
  return undefined;
}

export function setCachedJson(key: string, data: unknown): void {
  // Keep the cache small — storefront uses a handful of keys.
  if (store().size > 40) store().clear();
  store().set(key, { data, at: Date.now() });
}

/**
 * Fetch JSON with a short client-side memory cache + focus revalidation.
 *
 * - First mount: serves the cached value instantly when present (no spinner),
 *   then revalidates in the background.
 * - Window focus: always revalidates, so admin edits show up right away.
 */
export function useCachedJson<T>(url: string, ttlMs: number): {
  data: T | null;
  loading: boolean;
  error: boolean;
  refresh: () => void;
} {
  const key = `GET ${url}`;
  const [data, setData] = useState<T | null>(() => getCachedJson<T>(key, ttlMs) ?? null);
  const [loading, setLoading] = useState<boolean>(() => getCachedJson<T>(key, ttlMs) === undefined);
  const [error, setError] = useState(false);
  const mounted = useRef(true);

  const fetchNow = useCallback(
    async (force: boolean) => {
      if (!force) {
        const hit = getCachedJson<T>(key, ttlMs);
        if (hit !== undefined) {
          setData(hit);
          setLoading(false);
          // Fresh cache hit — still revalidate quietly in the background.
        }
      }
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("failed");
        const json = (await res.json()) as T;
        setCachedJson(key, json);
        if (mounted.current) {
          setData(json);
          setError(false);
        }
      } catch {
        if (mounted.current && getCachedJson<T>(key, ttlMs) === undefined) setError(true);
      } finally {
        if (mounted.current) setLoading(false);
      }
    },
    [key, ttlMs, url]
  );

  useEffect(() => {
    mounted.current = true;
    void fetchNow(false);
    const onFocus = () => void fetchNow(false);
    window.addEventListener("focus", onFocus);
    return () => {
      mounted.current = false;
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchNow]);

  return { data, loading, error, refresh: () => void fetchNow(true) };
}
