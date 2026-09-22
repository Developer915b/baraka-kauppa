// Site settings — the editable "Site data" the shop owner manages from the
// admin panel (Shop details / Delivery / Contact page message).
//
// Storage: Supabase `site_settings` (key/value rows). Everything falls back to
// the defaults below when a key is missing or the table does not exist yet
// (one-time SQL still pending), so the site keeps working with no surprises.
//
// Reads are cached in memory for 60 s to keep database usage minimal; admin
// saves invalidate the cache immediately.

import { cached, clearCache } from "@/lib/cache";
import { SbError, sbFetch } from "@/lib/supabase";

export type SiteSettings = {
  shopName: string;
  phone: string;
  email: string;
  address: string;
  postalCode: string;
  city: string;
  facebookUrl: string;
  hoursWeekdays: string;
  hoursSaturday: string;
  hoursSunday: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  deliveryArea: string;
  contactNoteEn: string;
  contactNoteFi: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  shopName: "Baraka Kauppa",
  phone: "+358 45 8652799",
  email: "hossainsohid@gmail.com",
  address: "Kouvolankatu 34 A31",
  postalCode: "45100",
  city: "Kouvola",
  facebookUrl: "https://www.facebook.com/people/Baraka-Kauppa/61592352316861/",
  hoursWeekdays: "10:00 – 22:00",
  hoursSaturday: "10:00 – 22:00",
  hoursSunday: "12:00 – 18:00",
  deliveryFee: 4.9,
  freeDeliveryThreshold: 40,
  deliveryArea: "Kouvola area",
  contactNoteEn: "",
  contactNoteFi: "",
};

type SbSettingRow = { key: string; value: string };

function coerce(row: Partial<SiteSettings>): SiteSettings {
  const s = { ...DEFAULT_SETTINGS };
  const str = (v: unknown, fallback: string) =>
    typeof v === "string" && v.trim() !== "" ? v.trim() : fallback;
  s.shopName = str(row.shopName, s.shopName);
  s.phone = str(row.phone, s.phone);
  s.email = str(row.email, s.email);
  s.address = str(row.address, s.address);
  s.postalCode = str(row.postalCode, s.postalCode);
  s.city = str(row.city, s.city);
  s.facebookUrl = typeof row.facebookUrl === "string" ? row.facebookUrl.trim() : s.facebookUrl;
  s.hoursWeekdays = str(row.hoursWeekdays, s.hoursWeekdays);
  s.hoursSaturday = str(row.hoursSaturday, s.hoursSaturday);
  s.hoursSunday = str(row.hoursSunday, s.hoursSunday);
  s.deliveryArea = str(row.deliveryArea, s.deliveryArea);
  s.contactNoteEn = typeof row.contactNoteEn === "string" ? row.contactNoteEn.trim() : "";
  s.contactNoteFi = typeof row.contactNoteFi === "string" ? row.contactNoteFi.trim() : "";

  const fee = Number(row.deliveryFee);
  if (Number.isFinite(fee) && fee >= 0 && fee <= 100) s.deliveryFee = Math.round(fee * 100) / 100;
  const thr = Number(row.freeDeliveryThreshold);
  if (Number.isFinite(thr) && thr >= 0 && thr <= 10000)
    s.freeDeliveryThreshold = Math.round(thr * 100) / 100;
  return s;
}

function rowsToSettings(rows: SbSettingRow[]): SiteSettings {
  const partial: Record<string, string> = {};
  for (const row of rows) partial[row.key] = row.value;
  return coerce(partial as Partial<SiteSettings>);
}

export async function getSettings(): Promise<SiteSettings> {
  try {
    return await cached("settings:all", 60_000, async () => {
      const rows = await sbFetch<SbSettingRow[]>({ path: "/site_settings?select=key,value" });
      return rowsToSettings(rows);
    });
  } catch (err) {
    if (err instanceof SbError) {
      // Table missing or unreachable -> defaults keep the site running.
      console.error(`[settings] read failed, using defaults: ${err.message}`);
    }
    return { ...DEFAULT_SETTINGS };
  }
}

function sanitise(body: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  const textKeys: (keyof SiteSettings)[] = [
    "shopName",
    "phone",
    "email",
    "address",
    "postalCode",
    "city",
    "facebookUrl",
    "hoursWeekdays",
    "hoursSaturday",
    "hoursSunday",
    "deliveryArea",
    "contactNoteEn",
    "contactNoteFi",
  ];
  for (const key of textKeys) {
    const raw = body[key];
    if (raw === undefined || raw === null) continue;
    out[key] = String(raw).slice(0, 500);
  }
  const fee = Number(body.deliveryFee);
  if (Number.isFinite(fee) && fee >= 0 && fee <= 100) out.deliveryFee = String(Math.round(fee * 100) / 100);
  const thr = Number(body.freeDeliveryThreshold);
  if (Number.isFinite(thr) && thr >= 0 && thr <= 10000)
    out.freeDeliveryThreshold = String(Math.round(thr * 100) / 100);
  return out;
}

export async function saveSettings(body: Record<string, unknown>): Promise<SiteSettings> {
  const patch = sanitise(body);
  const entries = Object.entries(patch);
  if (entries.length === 0) throw new SbError("Nothing to save", 400);

  // Upsert key/value rows one request (PostgREST bulk upsert on pk key).
  await sbFetch<null>({
    method: "POST",
    path: "/site_settings?on_conflict=key",
    body: entries.map(([key, value]) => ({ key, value })),
    prefer: "resolution=merge-duplicates",
    write: true,
  });
  clearCache();
  return getSettings();
}
