import { prisma } from "@/lib/prisma";
import { press as staticPress } from "@/data/press";
import type { PressMention } from "@/types";
import type { PressMention as PrismaPressMention } from "@prisma/client";

function mapDbPressMention(mention: PrismaPressMention): PressMention {
  return {
    id: mention.id,
    title: mention.title,
    source: mention.source,
    url: mention.url,
    excerpt: mention.excerpt,
    publishedAt: mention.publishedAt.toISOString(),
  };
}

async function getDbPressMentions(): Promise<PressMention[]> {
  const rows = await prisma.pressMention.findMany({ orderBy: { publishedAt: "desc" } });
  return rows.map(mapDbPressMention);
}

// DB'de basın haberi varsa onları kullan; hiç yoksa (henüz panel içeriği
// girilmemişse) statik data/press.ts'e düş — Author/Product'taki
// DB-öncelikli + statik-yedekli desenin aynısı.
export async function getPressMentions(): Promise<PressMention[]> {
  const dbMentions = await getDbPressMentions();
  if (dbMentions.length > 0) return dbMentions;

  return [...staticPress].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}
