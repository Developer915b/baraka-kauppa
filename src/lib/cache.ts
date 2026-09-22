// Tiny in-memory TTL cache.
//
// Purpose: cut down database reads. Storefront pages hit the same few queries
// (product list, product by slug, site settings) many times per minute; with a
// short TTL each running server instance serves them from memory and the
// database only sees one read per TTL window.
//
// - `cached(key, ttlMs, fn)` — read-through helper
// - `invalidateCache(prefix)` — drop entries whose key starts with the prefix
//   (admin writes call this so changes appear immediately for the admin and,
//    at most ttlMs later, for everyone else)

type Entry = { value: unknown; expires: number };

const globalForCache = globalThis as unknown as {
  bkCache: Map<string, Entry> | undefined;
};

function store(): Map<string, Entry> {
  if (!globalForCache.bkCache) globalForCache.bkCache = new Map();
  return globalForCache.bkCache;
}

export async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = store().get(key);
  if (hit && hit.expires > now) {
    return hit.value as T;
  }
  const value = await fn();
  store().set(key, { value, expires: Date.now() + ttlMs });
  return value;
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
}
