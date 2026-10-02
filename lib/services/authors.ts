import { prisma } from "@/lib/prisma";
import { authors as staticAuthors } from "@/data/authors";
import type { Author } from "@/types";
import type { Author as PrismaAuthor } from "@prisma/client";

// Yazar/kategori id eşleşmesi: statik data/authors.ts'te id === slug (bkz.
// prisma/seedCms.ts, lib/services/products.ts). Aynı köprüyü burada da
// kuruyoruz — site tipindeki Author.id alanına DB kaydının slug'ını
// yazıyoruz ki Product/BlogPost'un authorId'si (author?.slug olarak
// dolduruluyor, bkz. lib/services/products.ts) getAuthorById ile hâlâ
// değişmeden eşleşsin.
function mapDbAuthor(author: PrismaAuthor): Author {
  return {
    id: author.slug,
    slug: author.slug,
    name: author.name,
    photo: author.photo ?? "",
    shortBio: author.shortBio ?? "",
    bio: author.bio ?? "",
    socials: {
      instagram: author.socialInstagram ?? undefined,
      twitter: author.socialTwitter ?? undefined,
      website: author.socialWebsite ?? undefined,
    },
    spotifyPlaylistUrl: author.spotifyPlaylistUrl ?? undefined,
  };
}

async function getDbAuthors(): Promise<Author[]> {
  const rows = await prisma.author.findMany({ orderBy: { name: "asc" } });
  return rows.map(mapDbAuthor);
}

// DB'de yazar varsa onları kullan; hiç yoksa (henüz seed/panel içeriği
// girilmemişse) statik data/authors.ts'e düş — Product/Category'deki
// DB-öncelikli + statik-yedekli desenin aynısı.
export async function getAuthors(): Promise<Author[]> {
  const dbAuthors = await getDbAuthors();
  return dbAuthors.length > 0 ? dbAuthors : staticAuthors;
}

export async function getAuthorBySlug(slug: string): Promise<Author | undefined> {
  const authors = await getAuthors();
  return authors.find((author) => author.slug === slug);
}

export async function getAuthorById(id: string): Promise<Author | undefined> {
  const authors = await getAuthors();
  return authors.find((author) => author.id === id);
}
