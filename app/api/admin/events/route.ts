import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseIstanbulDateTime } from "@/lib/formatDate";
import { requireCmsAccess } from "@/lib/adminGuard";
import { generateEventSlug } from "@/lib/eventSlug";

// Etkinlikte yalnızca Tarih ve Saat zorunlu; diğer metin alanları boş
// gelebilir (DB kolonları NOT NULL olduğu için boş string olarak saklanır).
function text(input: unknown): string {
  return typeof input === "string" ? input.trim() : "";
}

function parseAuthorIds(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input.filter((id): id is string => typeof id === "string" && id.length > 0);
}

// Boş bırakılırsa null (detay sayfasında hiç gösterilmez) — "0" || 0 gibi
// falsy-tabanlı bir kısayol burada YANLIŞ olurdu, çünkü 0 "Kontenjan: Dolu"
// anlamına gelen geçerli bir değer (bkz. prisma/schema.prisma Event.capacity).
function parseCapacity(input: unknown): number | null {
  if (typeof input !== "string" || input.trim() === "") return null;
  const parsed = Number.parseInt(input, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function POST(request: Request) {
  const { response } = await requireCmsAccess();
  if (response) return response;

  const body = await request.json().catch(() => null);
  // Tarih zorunlu ("YYYY-MM-DD"), saat opsiyonel ("HH:mm"); saatsizse
  // İstanbul 00.00 kaydedilir ve hasTime=false olur.
  const time = text(body?.time);
  const hasTime = time !== "";
  const date =
    typeof body?.date === "string" && body.date
      ? parseIstanbulDateTime(`${body.date.slice(0, 10)}T${hasTime ? time : "00:00"}`)
      : null;
  if (!date || Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  let slug = text(body.slug);
  if (slug) {
    const existing = await prisma.event.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "SLUG_TAKEN" }, { status: 409 });
    }
  } else {
    slug = await generateEventSlug({ title: text(body.title), speaker: text(body.speaker), date });
  }

  const requestedStatus =
    body.status === "PUBLISHED" || body.status === "SCHEDULED" ? body.status : "DRAFT";
  const scheduledAt = requestedStatus === "SCHEDULED" && body.scheduledAt ? parseIstanbulDateTime(body.scheduledAt) : null;
  const authorIds = parseAuthorIds(body.authorIds);

  const event = await prisma.event.create({
    data: {
      title: text(body.title),
      slug,
      shortDescription: text(body.shortDescription),
      description: text(body.description),
      date,
      hasTime,
      location: text(body.location),
      category: body.category?.trim() || null,
      speaker: body.speaker?.trim() || null,
      coverImage: body.coverImage || null,
      calendarThumbnailUrl: body.calendarThumbnailUrl || null,
      capacity: parseCapacity(body.capacity),
      status: requestedStatus,
      scheduledAt,
      authors: { create: authorIds.map((authorId) => ({ authorId })) },
      seoTitle: body.seoTitle || null,
      seoDescription: body.seoDescription || null,
      canonicalUrl: body.canonicalUrl || null,
      ogTitle: body.ogTitle || null,
      ogDescription: body.ogDescription || null,
      ogImage: body.ogImage || null,
      noIndex: Boolean(body.noIndex),
    },
  });

  return NextResponse.json({ event }, { status: 201 });
}
