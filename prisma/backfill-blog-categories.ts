import { prisma } from "../lib/prisma";

// BlogPost.category (serbest metin) alanını Category modeliyle ilişkisel
// categoryId alanına taşır. Her benzersiz kategori metni için: aynı isimde
// (nameTr, büyük/küçük harf duyarsız) bir Category satırı varsa ona bağlanır;
// yoksa slug'lanıp yeni bir Category satırı oluşturulur. category alanı NULL
// olan yazılar (henüz kategorisiz) etkilenmez. Veri kaybı olmaz — bu script
// çalıştırıldıktan sonra eski "category" string alanı ayrı bir migration'da
// kaldırılacak.
//
// Kullanım (proje kök dizininde, doğru DATABASE_URL/DATABASE_URL_UNPOOLED ile):
//   npx tsx prisma/backfill-blog-categories.ts

const TR_MAP: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  ö: "o",
  ş: "s",
  ü: "u",
  Ç: "c",
  Ğ: "g",
  İ: "i",
  I: "i",
  Ö: "o",
  Ş: "s",
  Ü: "u",
};

function slugify(input: string): string {
  const replaced = input.replace(/[çğıöşüÇĞİIÖŞÜ]/g, (ch) => TR_MAP[ch] ?? ch);
  return replaced
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  const posts = await prisma.$queryRawUnsafe<{ id: string; category: string | null }[]>(
    `SELECT id, category FROM "BlogPost" WHERE category IS NOT NULL AND "categoryId" IS NULL;`,
  );

  if (posts.length === 0) {
    console.log("Kategorisi olup categoryId'si boş olan blog yazısı yok, yapılacak iş yok.");
    return;
  }

  const distinctNames = Array.from(new Set(posts.map((p) => p.category!.trim()).filter(Boolean)));
  console.log(`${posts.length} blog yazısı, ${distinctNames.length} benzersiz kategori metni bulundu:`, distinctNames);

  const nameToId = new Map<string, string>();
  let createdCount = 0;
  let matchedCount = 0;

  for (const name of distinctNames) {
    const existing = await prisma.category.findFirst({
      where: { nameTr: { equals: name, mode: "insensitive" } },
    });

    if (existing) {
      nameToId.set(name, existing.id);
      matchedCount += 1;
      console.log(`"${name}" -> var olan kategoriye bağlandı (slug: ${existing.slug}).`);
      continue;
    }

    const baseSlug = slugify(name) || `kategori-${Date.now()}`;
    let slug = baseSlug;
    let suffix = 2;
    while (await prisma.category.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const created = await prisma.category.create({
      data: { slug, nameTr: name, nameEn: name },
    });
    nameToId.set(name, created.id);
    createdCount += 1;
    console.log(`"${name}" -> yeni kategori oluşturuldu (slug: ${slug}).`);
  }

  let updatedCount = 0;
  for (const post of posts) {
    const categoryId = nameToId.get(post.category!.trim());
    if (!categoryId) continue;
    await prisma.blogPost.update({ where: { id: post.id }, data: { categoryId } });
    updatedCount += 1;
  }

  console.log(
    `Tamamlandı: ${updatedCount} blog yazısı güncellendi, ${createdCount} yeni kategori oluşturuldu, ${matchedCount} kategori var olana eşlendi.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
