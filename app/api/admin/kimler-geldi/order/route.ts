import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCmsAccess } from "@/lib/adminGuard";

// Admin listesindeki sürükle-bırak sıralaması: gönderilen id sırasına göre
// tüm galerilerin "Sıra"sı 1, 2, 3… olarak yeniden yazılır (tek işlemde).
// Liste eksik ya da fazla id içeriyorsa (ör. başka sekmede galeri eklenmiş)
// reddedilir — yarım bir sıralama kaydedilmesin.
export async function PATCH(request: Request) {
  const { response } = await requireCmsAccess();
  if (response) return response;

  const body = await request.json().catch(() => null);
  const ids: unknown = body?.ids;
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string") || new Set(ids).size !== ids.length) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const existing = await prisma.eventGallery.findMany({ select: { id: true } });
  const existingIds = new Set(existing.map((gallery) => gallery.id));
  if (ids.length !== existingIds.size || ids.some((id) => !existingIds.has(id))) {
    return NextResponse.json({ error: "LIST_CHANGED" }, { status: 409 });
  }

  await prisma.$transaction(
    (ids as string[]).map((id, index) =>
      prisma.eventGallery.update({ where: { id }, data: { order: index + 1 } }),
    ),
  );
  return NextResponse.json({ ok: true });
}
