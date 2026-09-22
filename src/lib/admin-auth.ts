// Simple, strong-enough admin auth for a small shop.
//
// - Password(s) come from env vars (never committed to the repo):
//   ADMIN_PASSWORD, ADMIN_PASSWORD_2, ADMIN_PASSWORD_3 — any one of them
//   signs the owner in, which makes it easy to share access safely.
// - Session = httpOnly cookie holding sha256(salt + primary password). The
//   cookie value never reveals a password and is verified on every request.

import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "bk_admin_session";
const SALT = "baraka-kauppa-admin-v1";
// Persistent sign-in: ~400 days (the browser maximum) — stays signed in
// until the owner explicitly signs out.
const MAX_AGE = 60 * 60 * 24 * 400;

export function getAdminPassword(): string {
  return getAdminPasswords()[0] ?? "";
}

/** Every admin password configured via env (primary + extras). */
export function getAdminPasswords(): string[] {
  const candidates = [
    process.env.ADMIN_PASSWORD,
    process.env.ADMIN_PASSWORD_2,
    process.env.ADMIN_PASSWORD_3,
  ];
  return candidates.filter((p): p is string => typeof p === "string" && p.length >= 6);
}

export function adminPasswordSet(): boolean {
  return getAdminPasswords().length > 0;
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
  const passwords = getAdminPasswords();
  if (passwords.length === 0) return false;
  // Any of the configured admin passwords signs the owner in.
  return passwords.some((expected) => safeEqual(password, expected));
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
