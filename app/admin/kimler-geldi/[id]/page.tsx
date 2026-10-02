import { notFound } from "next/navigation";
import { requireCmsSession } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";
import { getGalleryEventOptions } from "@/lib/services/eventGalleries";
import { GalleryForm } from "./GalleryForm";

export const metadata = { title: "Kimler Geldi? Galerisi" };

export default async function AdminEventGalleryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireCmsSession("/admin/kimler-geldi");
  const { id } = await params;

  if (id === "new") {
    const eventOptions = await getGalleryEventOptions();
    return (
      <div>
        <h2 className="mb-6 text-lg font-semibold">Yeni Galeri</h2>
        <GalleryForm initial={null} eventOptions={eventOptions} />
      </div>
    );
  }

  const gallery = await prisma.eventGallery.findUnique({ where: { id } });
  if (!gallery) notFound();
  const eventOptions = await getGalleryEventOptions(gallery.id);

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">Galeriyi Düzenle</h2>
      <GalleryForm initial={gallery} eventOptions={eventOptions} />
    </div>
  );
}
