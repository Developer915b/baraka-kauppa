import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  expectedAdminToken,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { password } = (await request.json()) ?? {};
    if (typeof password !== "string" || !verifyPassword(password)) {
      return NextResponse.json({ error: "Wrong password" }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE_NAME, expectedAdminToken(), sessionCookieOptions());
    return res;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
