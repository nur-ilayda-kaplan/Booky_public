import { prisma } from "@/lib/prisma";

// Kitap detay sayfasındaki "Satın Al" butonları için: admin panelinden
// eklenen aktif satış bağlantılarını slug üzerinden okur. Kitabın kendisi
// (başlık, fiyat, görsel) henüz data/products.ts üzerinden geliyor — bu
// fonksiyon sadece SalesLink verisini CMS veritabanından çeker.
export async function getActiveSalesLinksBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      salesLinks: {
        where: { active: true },
        orderBy: { order: "asc" },
      },
    },
  });

  return product?.salesLinks ?? [];
}
