// Simple, safe customer accounts for a small shop.
//
// - Passwords: node scrypt with a per-customer random salt (no extra deps).
// - Session: httpOnly cookie holding an HMAC of the customer id — the cookie
//   never exposes the password and is verified on every request.

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "bk_customer_session";
// Keep the customer signed in for as long as the browser allows (~400 days
// is the hard cap in Chrome/Safari; effectively "forever" until they sign out).
const MAX_AGE = 60 * 60 * 24 * 400;

const SECRET_BASE =
  process.env.CUSTOMER_SESSION_SECRET || process.env.ADMIN_PASSWORD || "baraka-kauppa-customers-v1";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  try {
    const candidate = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}

function sessionToken(customerId: number): string {
  const mac = createHmac("sha256", SECRET_BASE).update(`customer:${customerId}`).digest("hex");
  return `${customerId}.${mac}`;
}

/** Cookie value for a signed-in customer (used by the auth routes). */
export function customerSessionToken(customerId: number): string {
  return sessionToken(customerId);
}

function parseToken(token: string): number | null {
  const dot = token.indexOf(".");
  if (dot <= 0) return null;
  const idPart = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const id = Number(idPart);
  if (!Number.isInteger(id) || id <= 0) return null;
  const expected = createHmac("sha256", SECRET_BASE).update(`customer:${id}`).digest("hex");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b) ? id : null;
}

export function customerCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  };
}

export { COOKIE_NAME as CUSTOMER_COOKIE_NAME };

/** API routes: the signed-in customer id, or null. */
export function getCustomerIdFromRequest(request: NextRequest): number | null {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return parseToken(token);
}

/** Server components: the signed-in customer id, or null. */
export async function getCustomerIdFromSession(): Promise<number | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return parseToken(token);
}
