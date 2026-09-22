// Public keep-alive endpoint for the shop database (Supabase).
//
// Supabase pauses projects that see no activity for ~7 days on the free
// plan. Point an external cron service (e.g. cron-job.org) at this URL a
// couple of times a week and the tiny read query below keeps the database
// awake. No secrets are needed by default; if CRON_KEY is set in the
// environment, the call must include ?key=<CRON_KEY>.

import { NextRequest, NextResponse } from "next/server";
import { sbFetch } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requiredKey = process.env.CRON_KEY;
  if (requiredKey) {
    const provided = request.nextUrl.searchParams.get("key");
    if (provided !== requiredKey) {
      return NextResponse.json(
        { ok: false, error: "Invalid key" },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }
  }

  try {
    await sbFetch<unknown[]>({ path: "/products?select=id&limit=1" });
    return NextResponse.json(
      {
        ok: true,
        database: "awake",
        // Deployment version marker — lets the owner confirm which code is
        // live by simply opening this endpoint.
        version: "2026-09-22.2",
        time: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Database unreachable",
        time: new Date().toISOString(),
      },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
