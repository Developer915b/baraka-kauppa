import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { saveSettings } from "@/lib/settings";
import { SbError } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const settings = await saveSettings(body ?? {});
    return NextResponse.json({ ok: true, settings });
  } catch (err) {
    if (err instanceof SbError) {
      const friendly = err.setupRequired
        ? "Your store database needs its one-time setup before settings can be saved."
        : err.message;
      return NextResponse.json(
        { error: friendly, setupRequired: err.setupRequired },
        { status: err.setupRequired ? 503 : err.status }
      );
    }
    return NextResponse.json({ error: "Saving failed. Please try again." }, { status: 500 });
  }
}
