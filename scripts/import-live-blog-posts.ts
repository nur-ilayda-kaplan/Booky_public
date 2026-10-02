import "dotenv/config";
import { prisma } from "../lib/prisma";

// Canlı sitedeki (bookykitabevi.com) yayında blog yazılarını, .env'deki
// veritabanına aktarır — yerel/geliştirme veritabanı canlıdan ayrı olduğu
// için ana sayfa ve blog sayfaları yerelde de gerçek içerikle görünsün diye.
// Yazılar sayfa HTML'inden okunur ve slug'a göre eklenir/güncellenir
// (idempotent). Kapak görselleri canlıdaki Vercel Blob adresleriyle kalır.
//
// Kullanım: npx tsx scripts/import-live-blog-posts.ts [site-adresi]
const SITE = (process.argv[2] ?? "https://www.bookykitabevi.com").replace(/\/+$/, "");

const TR_MONTHS = [
  "ocak", "şubat", "mart", "nisan", "mayıs", "haziran",
  "temmuz", "ağustos", "eylül", "ekim", "kasım", "aralık",
];

function decodeEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

// Blog sayfasındaki ReactMarkdown çıktısını tekrar Markdown'a çevirir —
// yazılarda kullanılan temel öğeler (paragraf, başlık, liste, alıntı,
// kalın/italik, bağlantı) için yeterli.
function htmlToMarkdown(html: string): string {
  const inline = (value: string) =>
    decodeEntities(
      value
        .replace(/<(strong|b)>([\s\S]*?)<\/\1>/g, "**$2**")
        .replace(/<(em|i)>([\s\S]*?)<\/\1>/g, "*$2*")
        .replace(/<a [^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g, "[$2]($1)")
        .replace(/<br\s*\/?>/g, "  \n")
        .replace(/<[^>]+>/g, ""),
    ).trim();

  const blocks: string[] = [];
  const blockPattern = /<(p|h[1-6]|blockquote|ul|ol)[^>]*>([\s\S]*?)<\/\1>/g;
  for (const [, tag, inner] of html.matchAll(blockPattern)) {
    if (tag === "p") blocks.push(inline(inner));
    else if (tag.startsWith("h")) blocks.push(`${"#".repeat(Number(tag[1]))} ${inline(inner)}`);
    else if (tag === "blockquote") blocks.push(`> ${inline(inner)}`);
    else {
      const items = [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map(
        ([, item], index) => `${tag === "ol" ? `${index + 1}.` : "-"} ${inline(item)}`,
      );
      blocks.push(items.join("\n"));
    }
  }
  return blocks.filter(Boolean).join("\n\n");
}

function parseTurkishDate(value: string): Date | null {
  const match = value.trim().match(/^(\d{1,2})\s+(\S+)\s+(\d{4})$/);
  if (!match) return null;
  const month = TR_MONTHS.indexOf(match[2].toLocaleLowerCase("tr-TR"));
  if (month < 0) return null;
  // İstanbul öğlen — saat dilimi kaymasıyla gün değişmesin.
  return new Date(Date.UTC(Number(match[3]), month, Number(match[1]), 9));
}

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} → HTTP ${response.status}`);
  return response.text();
}

async function importPost(slug: string) {
  const html = await fetchHtml(`${SITE}/kitabevi/blog/${slug}`);
  const article = html.match(/<article[\s\S]*?<\/article>/)?.[0];
  if (!article) throw new Error(`${slug}: <article> bulunamadı`);

  const title = decodeEntities(article.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "").trim();
  const excerpt = decodeEntities(
    html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "",
  );
  const authorMatch = article.match(/href="\/kitabevi\/blog\?yazar=([^"]+)">([\s\S]*?)<\/a>/);
  const authorSlug = authorMatch ? decodeURIComponent(authorMatch[1]) : null;
  const authorName = authorMatch ? decodeEntities(authorMatch[2]).trim() : null;
  const dateText = [...article.matchAll(/<span>([^<]*\d{4})<\/span>/g)].map((m) => m[1]).pop();
  const publishedAt = (dateText && parseTurkishDate(decodeEntities(dateText))) || new Date();
  const imageUrl = article.match(/<img[^>]*src="\/_next\/image\?url=([^&"]+)/)?.[1];
  const coverImage = imageUrl ? decodeURIComponent(decodeEntities(imageUrl)) : null;
  // Yazıya özel OG görseli: yalnızca kapaktan farklıysa admin alanında
  // doluydu demektir (boşken sayfa kapağı og:image olarak basar).
  const ogImageMeta = html.match(/<meta property="og:image" content="([^"]*)"/)?.[1];
  const ogImageUrl = ogImageMeta ? decodeEntities(ogImageMeta) : null;
  const ogImage = ogImageUrl && ogImageUrl !== coverImage ? ogImageUrl : null;
  const proseStart = article.indexOf('class="prose');
  const content = htmlToMarkdown(proseStart >= 0 ? article.slice(proseStart) : article);

  if (!title || !content) throw new Error(`${slug}: başlık veya içerik boş`);

  const data = {
    title,
    excerpt,
    content,
    coverImage,
    ogImage,
    authorName,
    authorSlug,
    publishedAt,
    status: "PUBLISHED" as const,
  };
  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  await prisma.blogPost.upsert({ where: { slug }, create: { slug, ...data }, update: data });
  console.log(
    `${existing ? "Güncellendi" : "Eklendi"}: ${title} (${authorName ?? "yazar yok"}, ${publishedAt.toISOString().slice(0, 10)}, ${content.split("\n\n").length} paragraf)`,
  );
}

async function main() {
  const listHtml = await fetchHtml(`${SITE}/kitabevi/blog`);
  const slugs = [
    ...new Set([...listHtml.matchAll(/href="\/kitabevi\/blog\/([^"?#]+)"/g)].map((m) => m[1])),
  ];
  console.log(`${SITE} üzerinde ${slugs.length} yazı bulundu.`);
  for (const slug of slugs) {
    await importPost(slug);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
