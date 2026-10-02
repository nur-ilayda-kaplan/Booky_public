import Link from "next/link";
import { requireCmsSession } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";
import { GalleryOrderList, type GalleryRow } from "./GalleryOrderList";

export const metadata = { title: "Kimler Geldi?" };

export default async function AdminEventGalleriesListPage() {
  await requireCmsSession("/admin/kimler-geldi");

  // Sitedeki sırayla aynı (bkz. lib/services/eventGalleries.ts): "Sıra"
  // küçük önce, eşitse galerinin (yoksa bağlı etkinliğin) tarihi en yeni önce.
  const galleryTime = (gallery: { date: Date | null; event: { date: Date } | null }) =>
    (gallery.date ?? gallery.event?.date)?.getTime() ?? 0;
  const galleries = (
    await prisma.eventGallery.findMany({
      include: { event: { include: { authors: { include: { author: { select: { name: true } } } } } } },
    })
  ).sort((a, b) => a.order - b.order || galleryTime(b) - galleryTime(a));

  const rows: GalleryRow[] = galleries.map(({ id, name, date, images, order, active, event }) => ({
    id,
    name:
      name ||
      event?.speaker ||
      event?.authors.map((a) => a.author.name).join(", ") ||
      event?.title ||
      "(Adsız galeri)",
    date:
      (date ?? event?.date)?.toLocaleDateString("tr-TR", {
        dateStyle: "medium",
        timeZone: "Europe/Istanbul",
      }) ?? "Tarihsiz",
    cover: images[0] ?? "",
    imageCount: images.length,
    order,
    active,
  }));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Kimler Geldi? ({galleries.length})</h2>
        <Link
          href="/admin/kimler-geldi/new"
          className="rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Yeni Galeri
        </Link>
      </div>
      <p className="mb-6 text-xs text-foreground/50">
        Konuk fotoğrafları. Ana sayfada yaklaşan etkinliklerin altındaki &quot;Kimler Geldi?&quot;
        bölümünde (ilk 4 galeri) ve Kimler Geldi? sayfasında bu listedeki sırayla gösterilir; bir
        etkinliğe bağlı galerilerin fotoğrafları etkinliğin detay sayfasında da görünür. Sırayı
        değiştirmek için satırları sürükleyip bırakın (ya da ↑/↓ okları) ve &quot;Sırayı
        Kaydet&quot;e basın.
      </p>
      {/* Galeri eklenince/silinince liste durumu sıfırlansın; yalnızca sıra
          değişince (kaydetme sonrası) değil — "Sıra kaydedildi" mesajı kalsın. */}
      <GalleryOrderList
        key={rows
          .map((row) => row.id)
          .sort()
          .join(",")}
        rows={rows}
      />
    </div>
  );
}
