import { prisma } from "@/lib/prisma";
import { parseIstanbulDateTime } from "@/lib/formatDate";

type GalleryData = {
  eventId: string | null;
  name: string | null;
  date: Date | null;
  images: string[];
  note: string | null;
  order: number;
  active: boolean;
};

type ParsedGallery = { data: GalleryData } | { error: string; status: number };

function text(input: unknown): string {
  return typeof input === "string" ? input.trim() : "";
}

// "Kimler Geldi?" galerisi: en az bir görsel ve bir etkinlik ya da ad
// zorunlu (kartta gösterilecek bir isim olsun diye). Etkinlik ve tarih
// opsiyonel; tarih "YYYY-MM-DD" olarak gelir, İstanbul 00.00 kaydedilir.
export async function parseGalleryBody(body: unknown): Promise<ParsedGallery> {
  if (!body || typeof body !== "object") return { error: "INVALID_BODY", status: 400 };
  const input = body as Record<string, unknown>;

  const eventId = text(input.eventId) || null;
  const name = text(input.name) || null;
  const images = Array.isArray(input.images)
    ? input.images.filter((url): url is string => typeof url === "string" && url.trim() !== "")
    : [];
  if (images.length === 0) return { error: "NO_IMAGES", status: 400 };
  if (!eventId && !name) return { error: "NO_NAME", status: 400 };

  if (eventId) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return { error: "EVENT_NOT_FOUND", status: 400 };
  }

  const rawDate = text(input.date);
  const date = rawDate ? parseIstanbulDateTime(`${rawDate.slice(0, 10)}T00:00`) : null;
  if (date && Number.isNaN(date.getTime())) return { error: "INVALID_DATE", status: 400 };

  return {
    data: {
      eventId,
      name,
      date,
      images,
      note: text(input.note) || null,
      // Slider/Menü API'leriyle aynı: geçersiz ya da boşsa 0.
      order: Number.parseInt(String(input.order ?? ""), 10) || 0,
      active: input.active !== false,
    },
  };
}
