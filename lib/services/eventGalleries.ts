import type { EventGallery } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { mapDbEvent, type DbEvent } from "@/lib/services/events";
import type { EventGalleryItem } from "@/types";

type DbGallery = EventGallery & { event: DbEvent | null };

function mapDbGallery(row: DbGallery): EventGalleryItem {
  return {
    id: row.id,
    images: row.images,
    name: row.name ?? undefined,
    date: row.date?.toISOString(),
    note: row.note ?? undefined,
    event: row.event ? mapDbEvent(row.event) : undefined,
  };
}

// Eşit "Sıra"da ikincil ölçüt: galerinin kendi tarihi, yoksa bağlı
// etkinliğin tarihi (en yeni önce); ikisi de yoksa en sona düşer.
function galleryTime(row: DbGallery): number {
  const date = row.date ?? row.event?.date;
  return date ? date.getTime() : 0;
}

// "Kimler Geldi?" galerileri (admin: /admin/kimler-geldi): aktif, en az bir
// görseli olan ve — bir etkinliğe bağlıysa — etkinliği sitede görünür
// (yayında / zamanı gelmiş planlı) galeriler. Admin'deki "Sıra"ya göre
// (küçük önce), eşit sırada en yeni tarih önce.
export async function getEventGalleries(limit?: number): Promise<EventGalleryItem[]> {
  const rows = await prisma.eventGallery.findMany({
    where: {
      active: true,
      images: { isEmpty: false },
      OR: [
        { eventId: null },
        {
          event: {
            OR: [{ status: "PUBLISHED" }, { status: "SCHEDULED", scheduledAt: { lte: new Date() } }],
          },
        },
      ],
    },
    include: { event: { include: { authors: { include: { author: true } } } } },
  });

  const galleries = rows
    .sort((a, b) => a.order - b.order || galleryTime(b) - galleryTime(a))
    .map(mapDbGallery);
  return limit ? galleries.slice(0, limit) : galleries;
}

export async function getEventGalleryById(id: string): Promise<EventGalleryItem | undefined> {
  return (await getEventGalleries()).find((gallery) => gallery.id === id);
}

// Etkinlik detay sayfasındaki fotoğraflar (etkinliğe bağlı galeri varsa).
export async function getEventGalleryByEventId(eventId: string): Promise<EventGalleryItem | undefined> {
  return (await getEventGalleries()).find((gallery) => gallery.event?.id === eventId);
}

// Admin galeri formundaki opsiyonel etkinlik seçimi: tüm etkinlikler (tarih
// ve yayın durumundan bağımsız), en yeni önce. Başka bir galeriye zaten bağlı
// olanlar listelenmez (etkinlik başına tek galeri) — düzenlenen galerinin
// kendi etkinliği hariç.
export async function getGalleryEventOptions(
  currentGalleryId?: string,
): Promise<{ id: string; label: string }[]> {
  const rows = await prisma.event.findMany({
    where: { OR: [{ gallery: null }, ...(currentGalleryId ? [{ gallery: { id: currentGalleryId } }] : [])] },
    include: { authors: { include: { author: true } } },
    orderBy: { date: "desc" },
  });
  return rows.map(mapDbEvent).map((event) => {
    const name = event.speaker || event.authorNames?.join(", ") || event.title || "(Başlıksız etkinlik)";
    const day = new Date(event.date).toLocaleDateString("tr-TR", {
      dateStyle: "medium",
      timeZone: "Europe/Istanbul",
    });
    const title = event.title && event.title !== name ? ` — ${event.title}` : "";
    return { id: event.id, label: `${day} · ${name}${title}` };
  });
}
