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

// prisma/seedCms.ts ve prisma/backfill-blog-categories.ts'teki slugify ile
// aynı desen — Türkçe karakterleri ASCII karşılıklarına çevirip URL-güvenli
// bir slug üretir. Hem sunucu tarafı script'lerden hem "use client" form
// bileşenlerinden çağrılabilmesi için bağımsız bir modül olarak tutulur.
export function slugify(input: string): string {
  return input
    .replace(/[çğıöşüÇĞİIÖŞÜ]/g, (ch) => TR_MAP[ch] ?? ch)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
