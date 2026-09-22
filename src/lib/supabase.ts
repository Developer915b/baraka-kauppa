// Supabase REST (PostgREST) client — server-side only.
//
// Uses the modern Supabase API keys:
//   SUPABASE_PUBLISHABLE_KEY -> "sb_publishable_..." (anon role, RLS applies)
//   SUPABASE_SECRET_KEY      -> "sb_secret_..."     (service role, bypasses RLS)
//
// The secret key is only ever used inside server code (API routes).
// All calls go over HTTPS, so this works everywhere including Netlify
// serverless functions — no raw Postgres connection needed.

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/+$/, "");
const PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

export type SbStatus = {
  configured: boolean; // URL + at least one key present
  canRead: boolean;
  canWrite: boolean; // secret key present
};

export function sbStatus(): SbStatus {
  return {
    configured: Boolean(SUPABASE_URL && (SECRET_KEY || PUBLISHABLE_KEY)),
    canRead: Boolean(SUPABASE_URL && (SECRET_KEY || PUBLISHABLE_KEY)),
    canWrite: Boolean(SUPABASE_URL && SECRET_KEY),
  };
}

/** Thrown for any Supabase REST problem; `setupRequired` marks a missing table. */
export class SbError extends Error {
  setupRequired: boolean;
  status: number;
  constructor(message: string, status = 500, setupRequired = false) {
    super(message);
    this.status = status;
    this.setupRequired = setupRequired;
  }
}

function authHeaders(): Record<string, string> {
  const key = SECRET_KEY || PUBLISHABLE_KEY;
  if (!SUPABASE_URL || !key) {
    throw new SbError("Supabase is not configured", 503);
  }
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

type SbFetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  path: string; // e.g. "/products?select=*&order=id.asc"
  body?: unknown;
  prefer?: string; // PostgREST Prefer header
  write?: boolean; // force the secret key (must bypass RLS)
};

export async function sbFetch<T>(opts: SbFetchOptions): Promise<T> {
  const key = opts.write ? SECRET_KEY : SECRET_KEY || PUBLISHABLE_KEY;
  if (!SUPABASE_URL || !key) {
    throw new SbError(
      opts.write ? "Supabase secret key is not configured" : "Supabase is not configured",
      503
    );
  }

  const headers: Record<string, string> = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
  if (opts.prefer) headers.Prefer = opts.prefer;

  let res: Response;
  try {
    res = await fetch(`${SUPABASE_URL}/rest/v1${opts.path}`, {
      method: opts.method ?? "GET",
      headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      cache: "no-store",
    });
  } catch {
    throw new SbError("Could not reach Supabase", 502);
  }

  if (!res.ok) {
    let message = `Supabase error ${res.status}`;
    let setupRequired = false;
    try {
      const data = (await res.json()) as { message?: string; hint?: string; code?: string };
      if (data?.message) message = data.message;
      // PGRST205 = table not found in schema cache
      if (data?.code === "PGRST205" || /does not exist|Could not find the table/i.test(message)) {
        setupRequired = true;
        message = "Supabase tables are not created yet";
      }
    } catch {
      // keep default message
    }
    throw new SbError(message, res.status, setupRequired);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

/** Returns true when the REST API can list the products table. */
export async function sbCheckConnection(): Promise<{
  connected: boolean;
  setupRequired: boolean;
  message: string;
}> {
  try {
    await sbFetch<unknown[]>({ path: "/products?select=id&limit=1" });
    return { connected: true, setupRequired: false, message: "Connected to Supabase" };
  } catch (err) {
    if (err instanceof SbError) {
      return { connected: false, setupRequired: err.setupRequired, message: err.message };
    }
    return { connected: false, setupRequired: false, message: "Unknown Supabase error" };
  }
}
