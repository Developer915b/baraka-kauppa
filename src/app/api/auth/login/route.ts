import { NextRequest, NextResponse } from "next/server";
import { sbFetch, SbError } from "@/lib/supabase";
import {
  CUSTOMER_COOKIE_NAME,
  customerCookieOptions,
  customerSessionToken,
  verifyPassword,
} from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

type CustomerRow = {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  password_hash: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email ?? "").trim().toLowerCase().slice(0, 120);
    const password = String(body?.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ error: "Enter your email and password" }, { status: 400 });
    }

    const rows = await sbFetch<CustomerRow[]>({
      path: `/customers?select=id,email,name,phone,password_hash&email=eq.${encodeURIComponent(
        email
      )}&limit=1`,
      write: true,
    });
    if (rows.length === 0 || !verifyPassword(password, rows[0].password_hash)) {
      return NextResponse.json({ error: "Wrong email or password" }, { status: 401 });
    }

    const { password_hash: _hash, ...customer } = rows[0];
    const res = NextResponse.json({ ok: true, customer });
    res.cookies.set(
      CUSTOMER_COOKIE_NAME,
      customerSessionToken(Number(customer.id)),
      customerCookieOptions()
    );
    return res;
  } catch (err) {
    if (err instanceof SbError) {
      const friendly = err.setupRequired
        ? "Customer accounts need their one-time database setup. Please run the upgrade SQL in Supabase first."
        : err.message;
      return NextResponse.json({ error: friendly }, { status: err.status });
    }
    return NextResponse.json({ error: "Sign-in failed. Please try again." }, { status: 500 });
  }
}
