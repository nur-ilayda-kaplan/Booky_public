import { prisma } from "@/lib/prisma";
import { eventEndTime } from "@/lib/formatDate";
import { events as staticEvents } from "@/data/events";
import type { EventItem } from "@/types";
import type { Event as PrismaEvent, EventAuthor, Author } from "@prisma/client";

export type DbEvent = PrismaEvent & { authors: (EventAuthor & { author: Author })[] };

// Yazar id eşleşmesi: Product/BlogPost'ta olduğu gibi, DB kaydının
// ilişkili yazar slug'ını site tipindeki authorIds'e yazıyoruz — böylece
// getAuthorById (statik id şemasıyla uyumlu) değişmeden çalışmaya devam
// eder (bkz. lib/services/authors.ts, lib/services/products.ts).
export function mapDbEvent(event: DbEvent): EventItem {
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    shortDescription: event.shortDescription,
    description: event.description,
    date: event.date.toISOString(),
    hasTime: event.hasTime,
    location: event.location,
    category: event.category ?? undefined,
    speaker: event.speaker ?? undefined,
    coverImage: event.coverImage ?? "",
    calendarThumbnailUrl: event.calendarThumbnailUrl ?? undefined,
    capacity: event.capacity ?? undefined,
    authorIds: event.authors.map((eventAuthor) => eventAuthor.author.slug),
    authorNames: event.authors.map((eventAuthor) => eventAuthor.author.name),
    seoTitle: event.seoTitle ?? undefined,
    seoDescription: event.seoDescription ?? undefined,
    canonicalUrl: event.canonicalUrl ?? undefined,
    ogTitle: event.ogTitle ?? undefined,
    ogDescription: event.ogDescription ?? undefined,
    ogImage: event.ogImage ?? undefined,
    noIndex: event.noIndex,
  };
}

async function getDbEvents(): Promise<EventItem[]> {
  const rows = await prisma.event.findMany({
    where: {
      OR: [{ status: "PUBLISHED" }, { status: "SCHEDULED", scheduledAt: { lte: new Date() } }],
    },
    include: { authors: { include: { author: true } } },
    orderBy: { date: "asc" },
  });
  return rows.map(mapDbEvent);
}

// DB'de yayında etkinlik varsa onları kullan; hiç yoksa (henüz panel
// içeriği girilmemişse) statik data/events.ts'e düş — Product/Category'deki
// DB-öncelikli + statik-yedekli desenin aynısı.
export async function getEvents(): Promise<EventItem[]> {
  const dbEvents = await getDbEvents();
  const events = dbEvents.length > 0 ? dbEvents : staticEvents;
  return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function getEventBySlug(slug: string): Promise<EventItem | undefined> {
  const events = await getEvents();
  return events.find((event) => event.slug === slug);
}

export async function getUpcomingEvents(limit = 3): Promise<EventItem[]> {
  const now = Date.now();
  return (await getEvents()).filter((event) => eventEndTime(event) >= now).slice(0, limit);
}

// Etkinlikler sayfası ve ana sayfadaki takvim, "şimdi" karşılaştırmasını
// (Date.now() gibi saf olmayan bir çağrıyı) sayfa bileşeninin render'ı
// SIRASINDA değil burada, servis katmanında yapar — react-hooks/purity
// kuralı server component'lerde doğrudan Date.now()/new Date() çağrısına
// izin vermiyor (bkz. eslint hatası). Tek DB sorgusuyla hem geçmiş hem
// gelecek etkinlikleri döner.
export async function getUpcomingAndPastEvents(): Promise<{
  upcoming: EventItem[];
  past: EventItem[];
}> {
  const now = Date.now();
  const events = await getEvents();
  const upcoming = events.filter((event) => eventEndTime(event) >= now);
  // En yakın geçmiş etkinlik en üstte görünsün diye ters çevrilir —
  // getEvents() artan tarihe göre sıralı gelir.
  const past = events.filter((event) => eventEndTime(event) < now).reverse();
  return { upcoming, past };
}
