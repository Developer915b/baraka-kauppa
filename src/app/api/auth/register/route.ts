import { NextRequest, NextResponse } from "next/server";
import { sbFetch, SbError } from "@/lib/supabase";
import {
  CUSTOMER_COOKIE_NAME,
  customerCookieOptions,
  customerSessionToken,
  hashPassword,
} from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

type CustomerRow = {
  id: number;
  email: string;
  name: string;
  phone: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body?.name ?? "").trim().slice(0, 80);
    const email = String(body?.email ?? "").trim().toLowerCase().slice(0, 120);
    const phone = String(body?.phone ?? "").trim().slice(0, 40);
    const password = String(body?.password ?? "");

    if (name.length < 2) {
      return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password needs at least 6 characters" },
        { status: 400 }
      );
    }

    // Is the email already registered?
    const existing = await sbFetch<CustomerRow[]>({
      path: `/customers?select=id&email=eq.${encodeURIComponent(email)}&limit=1`,
      write: true,
    });
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "This email already has an account — try signing in instead" },
        { status: 409 }
      );
    }

    const created = await sbFetch<CustomerRow[]>({
      method: "POST",
      path: "/customers?select=id,email,name,phone",
      body: {
        email,
        name,
        phone: phone || null,
        password_hash: hashPassword(password),
      },
      prefer: "return=representation",
      write: true,
    });
    if (!created || created.length === 0) {
      throw new SbError("Account creation failed", 500);
    }

    const customer = created[0];
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
    return NextResponse.json(
      { error: "Account creation failed. Please try again." },
      { status: 500 }
    );
  }
}
