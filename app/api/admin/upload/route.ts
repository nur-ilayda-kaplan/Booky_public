import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireCmsAccess } from "@/lib/adminGuard"; // panele girebilen tüm roller
import { InvalidSvgError, sanitizeSvg } from "@/lib/sanitize";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  const { response } = await requireCmsAccess();
  if (response) return response;

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "NO_FILE" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "UNSUPPORTED_TYPE" }, { status: 415 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 413 });
  }

  let uploadBody: File | string = file;
  // SVG, <script>/on* handler'lar ve harici referanslar üzerinden depolanan
  // XSS taşıyabilir — kaydetmeden önce beyaz listeyle temizleniyor. Diğer
  // formatlar ikili veri olduğundan bu adıma girmiyor.
  if (file.type === "image/svg+xml") {
    try {
      uploadBody = sanitizeSvg(await file.text());
    } catch (error) {
      if (error instanceof InvalidSvgError) {
        return NextResponse.json({ error: "UPLOAD_FAILED", detail: error.message }, { status: 400 });
      }
      console.error("SVG sanitize failed:", error);
      const detail = error instanceof Error ? error.message : String(error);
      return NextResponse.json({ error: "UPLOAD_FAILED", detail }, { status: 500 });
    }
  }

  try {
    const blob = await put(`cms/${crypto.randomUUID()}-${file.name}`, uploadBody, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Blob upload failed:", error);
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "UPLOAD_FAILED", detail }, { status: 502 });
  }
}
