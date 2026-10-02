import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/adminGuard";

const FIELDS = [
  "logoUrl",
  "logoMobileUrl",
  "faviconUrl",
  "aboutImageUrl",
  "aboutLeadTr",
  "aboutLeadEn",
  "aboutBodyTr",
  "aboutBodyEn",
  "address",
  "phone",
  "email",
  "whatsapp",
  "workingHours",
  "mapEmbedUrl",
  "socialInstagram",
  "socialFacebook",
  "socialX",
  "socialYoutube",
  "socialLinkedin",
  "socialTiktok",
  "socialSpotify",
  "socialSubstack",
  "seoTitleDefault",
  "seoDescriptionDefault",
  "ogImageDefault",
] as const;

const BOOLEAN_FIELDS = [
  "whatsappEnabled",
  "socialInstagramEnabled",
  "socialFacebookEnabled",
  "socialXEnabled",
  "socialYoutubeEnabled",
  "socialLinkedinEnabled",
  "socialTiktokEnabled",
  "socialSpotifyEnabled",
  "socialSubstackEnabled",
] as const;

export async function PATCH(request: Request) {
  const { response } = await requireSuperAdmin();
  if (response) return response;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const data: Record<string, string | boolean | null> = {};
  for (const field of FIELDS) {
    if (typeof body[field] === "string") {
      data[field] = body[field] === "" ? null : body[field];
    }
  }
  for (const field of BOOLEAN_FIELDS) {
    if (typeof body[field] === "boolean") {
      data[field] = body[field];
    }
  }

  const updated = await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  return NextResponse.json({ settings: updated });
}
