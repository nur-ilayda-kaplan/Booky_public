import { prisma } from "@/lib/prisma";

// Page modelinin statik bir karşılığı yok (Hafta 1-2'de eklenen yeni bir
// içerik tipi) — bu yüzden fallback yok, doğrudan DB'den okunur.
export async function getPublishedPageBySlug(slug: string) {
  return prisma.page.findFirst({
    where: {
      slug,
      OR: [{ status: "PUBLISHED" }, { status: "SCHEDULED", scheduledAt: { lte: new Date() } }],
    },
  });
}

export async function getPublishedPageSlugs(): Promise<string[]> {
  const pages = await prisma.page.findMany({
    where: {
      OR: [{ status: "PUBLISHED" }, { status: "SCHEDULED", scheduledAt: { lte: new Date() } }],
    },
    select: { slug: true },
  });
  return pages.map((page) => page.slug);
}

// Menü admin ekranındaki "Dahili Sayfa" seçicisi için: sitede gerçekten
// görünür olan (PUBLISHED veya süresi gelmiş SCHEDULED) sayfaları listeler.
export async function getPublishedPagesForMenu(): Promise<{ slug: string; title: string }[]> {
  return prisma.page.findMany({
    where: {
      OR: [{ status: "PUBLISHED" }, { status: "SCHEDULED", scheduledAt: { lte: new Date() } }],
    },
    select: { slug: true, title: true },
    orderBy: { title: "asc" },
  });
}
