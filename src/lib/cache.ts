// Tiny in-memory cache with stale-while-revalidate and in-flight dedup.
//
// Purpose: cut down database reads. Storefront pages hit the same few queries
// (product list, product by slug, site settings) many times per minute; with
// this cache each running server instance serves them from memory and the
// database only sees one read per TTL window.
//
// Guarantees:
// - Fresh within `ttlMs` — served straight from memory (zero DB reads).
// - After `ttlMs` the cached value is still served INSTANTLY (stale) while a
//   background refresh runs, so visitors never wait on the database. A hard
//   `maxStaleMs` ceiling (default 10x TTL) forces a blocking refresh if the
//   background refresh keeps failing, so data can never go ancient.
// - Concurrent misses for the same key share one in-flight promise — a burst
//   of parallel requests results in exactly one database read.
// - Realtime changes: every admin write calls clearCache(), which drops the
//   entries so the very next read fetches fresh data. On other server
//   instances changes appear within one TTL window (background refresh).
//   Admin-facing reads (orders, product lists in the admin panel) are NOT
//   cached, so the owner always sees live data.

type Entry = { value: unknown; expires: number; staleUntil: number };

const globalForCache = globalThis as unknown as {
  bkCache: Map<string, Entry> | undefined;
  bkCacheInflight: Map<string, Promise<unknown>> | undefined;
};

function store(): Map<string, Entry> {
  if (!globalForCache.bkCache) globalForCache.bkCache = new Map();
  return globalForCache.bkCache;
}

function inflight(): Map<string, Promise<unknown>> {
  if (!globalForCache.bkCacheInflight) globalForCache.bkCacheInflight = new Map();
  return globalForCache.bkCacheInflight;
}

async function runFetch<T>(key: string, fn: () => Promise<T>, ttlMs: number, maxStaleMs: number): Promise<T> {
  const existing = inflight().get(key);
  if (existing) return existing as Promise<T>;

  const promise = (async () => {
    const value = await fn();
    const now = Date.now();
    store().set(key, { value, expires: now + ttlMs, staleUntil: now + ttlMs + maxStaleMs });
    return value;
  })().finally(() => {
    inflight().delete(key);
  });

  inflight().set(key, promise);
  return promise;
}

export async function cached<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>,
  opts?: { maxStaleMs?: number }
): Promise<T> {
  const maxStaleMs = opts?.maxStaleMs ?? ttlMs * 10;
  const now = Date.now();
  const hit = store().get(key);

  if (hit && hit.expires > now) {
    return hit.value as T;
  }

  // Stale-but-usable: answer immediately from memory and refresh in the
  // background so the next visitor gets fresh data without waiting.
  if (hit && hit.staleUntil > now) {
    void runFetch(key, fn, ttlMs, maxStaleMs).catch(() => {
      // Background refresh failed — the stale value stays until the
      // maxStale ceiling forces a blocking retry.
    });
    return hit.value as T;
  }

  // No usable entry — block on a (deduplicated) fresh fetch.
  return runFetch(key, fn, ttlMs, maxStaleMs);
}

export function invalidateCache(prefix: string): void {
  const map = store();
  for (const key of map.keys()) {
    if (key.startsWith(prefix)) map.delete(key);
  }
}

/** Drop every cached entry (used after admin writes keep it simple + safe). */
export function clearCache(): void {
  store().clear();
  inflight().clear();
}
