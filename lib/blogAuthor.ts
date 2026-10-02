import { slugify } from "@/lib/slugify";

// Blog yazar adı admin panelinde elle giriliyor. Gruplama/filtreleme adın
// kendisiyle değil, ondan türetilen slug ile yapılır — "Merve Yılmaz",
// "merve yılmaz" ve "Merve  Yilmaz" aynı anahtara (merve-yilmaz) düşer.
// Hem API route'larından hem "use client" formdan çağrılabilir.

export function normalizeAuthorName(input: unknown): string | null {
  if (typeof input !== "string") return null;
  return input.trim().replace(/\s+/g, " ") || null;
}

export function toAuthorSlug(name: string | null): string | null {
  if (!name) return null;
  return slugify(name) || null;
}

export interface BlogAuthorOption {
  slug: string;
  name: string;
}

// Aynı slug'a düşen farklı yazımlar arasından en çok kullanılanı gösterilecek
// ad olarak seçer; eşitlikte listede önce geleni korur.
export function pickAuthorOptions(
  entries: { slug: string; name: string; count: number }[],
): BlogAuthorOption[] {
  const best = new Map<string, { name: string; count: number }>();
  for (const entry of entries) {
    const current = best.get(entry.slug);
    if (!current || entry.count > current.count) {
      best.set(entry.slug, { name: entry.name, count: entry.count });
    }
  }
  return Array.from(best, ([slug, { name }]) => ({ slug, name })).sort((a, b) =>
    a.name.localeCompare(b.name, "tr"),
  );
}
