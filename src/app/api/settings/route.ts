import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

/** Public site settings for the storefront (contact info, delivery, hours). */
export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({ settings });
}
