// Simple, strong-enough admin auth for a single-owner store.
//
// - Password comes from ADMIN_PASSWORD env var (never committed to the repo —
//   it IS provided via netlify.toml/.env by the owner).
// - Session = httpOnly cookie holding sha256(ADMIN_PASSWORD + salt). The
//   cookie value never reveals the password and is verified on every request.

import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "bk_admin_session";
const SALT = "baraka-kauppa-admin-v1";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

export function adminPasswordSet(): boolean {
  return getAdminPassword().length >= 6;
}

export function expectedAdminToken(): string {
  return createHash("sha256").update(`${SALT}:${getAdminPassword()}`).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function verifyPassword(password: string): boolean {
  const expected = getAdminPassword();
  if (!expected) return false;
  return safeEqual(password, expected);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  };
}

export { COOKIE_NAME as ADMIN_COOKIE_NAME };

/** API routes: true when the request carries a valid admin session cookie. */
export function isAdminRequest(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return safeEqual(token, expectedAdminToken());
}

/** Server components: true when the current visitor is the admin. */
export async function isAdminSession(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return safeEqual(token, expectedAdminToken());
}
