import { prisma } from "@/lib/prisma";
import { blogPosts as staticBlogPosts } from "@/data/blogPosts";
import type { BlogPost } from "@/types";
import { pickAuthorOptions, type BlogAuthorOption } from "@/lib/blogAuthor";
import type { BlogPost as PrismaBlogPost, Author } from "@prisma/client";

type DbBlogPost = PrismaBlogPost & { author: Author | null };

// authorId eşleşmesi: bkz. lib/services/products.ts başındaki not — statik
// yazar id'leri slug ile aynı, o yüzden ilişkili yazarın slug'ı yazılıyor.
// Blogda kategori kullanılmıyor; DB'deki categoryId sütunu yalnızca eski
// veriler için duruyor ve burada okunmuyor.
function mapDbBlogPost(post: DbBlogPost): BlogPost {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.coverImage ?? "",
    authorId: post.author?.slug ?? "",
    authorName: post.authorName ?? undefined,
    authorSlug: post.authorSlug ?? undefined,
    publishedAt: (post.publishedAt ?? post.createdAt).toISOString(),
    seoTitle: post.seoTitle ?? undefined,
    seoDescription: post.seoDescription ?? undefined,
    canonicalUrl: post.canonicalUrl ?? undefined,
    ogTitle: post.ogTitle ?? undefined,
    ogDescription: post.ogDescription ?? undefined,
    ogImage: post.ogImage ?? undefined,
    noIndex: post.noIndex,
  };
}

async function getDbBlogPosts(): Promise<BlogPost[]> {
  const rows = await prisma.blogPost.findMany({
    where: {
      OR: [{ status: "PUBLISHED" }, { status: "SCHEDULED", scheduledAt: { lte: new Date() } }],
    },
    include: { author: true },
    orderBy: { publishedAt: "desc" },
  });
  return rows.map(mapDbBlogPost);
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const dbPosts = await getDbBlogPosts();
  if (dbPosts.length > 0) return dbPosts;

  return [...staticBlogPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const posts = await getBlogPosts();
  return posts.find((post) => post.slug === slug);
}

export async function getRelatedBlogPosts(post: BlogPost, limit = 3): Promise<BlogPost[]> {
  const posts = await getBlogPosts();
  return posts.filter((candidate) => candidate.id !== post.id).slice(0, limit);
}

export async function getBlogPostsByAuthor(authorId: string): Promise<BlogPost[]> {
  const posts = await getBlogPosts();
  return posts.filter((post) => post.authorId === authorId);
}

// Yayındaki yazılardan yazar filtresi seçenekleri; aynı slug'a düşen farklı
// yazımlardan en çok kullanılanı gösterilir.
export async function getBlogAuthors(): Promise<BlogAuthorOption[]> {
  const posts = await getBlogPosts();
  const counts = new Map<string, { slug: string; name: string; count: number }>();
  for (const post of posts) {
    if (!post.authorSlug || !post.authorName) continue;
    const key = `${post.authorSlug}\u0000${post.authorName}`;
    const entry = counts.get(key) ?? { slug: post.authorSlug, name: post.authorName, count: 0 };
    entry.count += 1;
    counts.set(key, entry);
  }
  return pickAuthorOptions(Array.from(counts.values()));
}
