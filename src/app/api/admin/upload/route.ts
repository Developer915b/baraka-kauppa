import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  ACCEPTED_MIME,
  MAX_UPLOAD_BYTES,
  optimiseAndUploadImage,
} from "@/lib/storage";
import { SbError } from "@/lib/supabase";

export const dynamic = "force-dynamic";
// Node runtime: sharp image processing
export const runtime = "nodejs";

const MAX_FILES_PER_REQUEST = 8;

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Could not read the upload" }, { status: 400 });
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "No image was selected" }, { status: 400 });
  }
  if (files.length > MAX_FILES_PER_REQUEST) {
    return NextResponse.json(
      { error: `Please upload at most ${MAX_FILES_PER_REQUEST} photos at a time` },
      { status: 400 }
    );
  }

  const urls: string[] = [];
  try {
    for (const file of files) {
      if (file.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json(
          { error: `"${file.name}" is too large — please choose a photo under 12 MB` },
          { status: 400 }
        );
      }
      if (file.type && !ACCEPTED_MIME.has(file.type)) {
        return NextResponse.json(
          { error: `"${file.name}" is not a supported photo (use JPG, PNG, WebP or HEIC)` },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const { url } = await optimiseAndUploadImage(buffer, file.name || "photo");
      urls.push(url);
    }
  } catch (err) {
    if (err instanceof SbError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Image upload failed. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, urls });
}
