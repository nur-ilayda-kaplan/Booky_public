import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseIstanbulDateTime } from "@/lib/formatDate";
import { normalizeAuthorName, toAuthorSlug } from "@/lib/blogAuthor";
import { requireBlogAccess, canPublishBlog } from "@/lib/adminGuard";

function parseTags(input: unknown): string[] {
  if (typeof input !== "string") return [];
  return input
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export async function POST(request: Request) {
  const { session, response } = await requireBlogAccess();
  if (response) return response;

  const body = await request.json().catch(() => null);
  if (!body?.title || !body?.slug || !body?.excerpt || !body?.content) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const existing = await prisma.blogPost.findUnique({ where: { slug: body.slug } });
  if (existing) {
    return NextResponse.json({ error: "SLUG_TAKEN" }, { status: 409 });
  }

  const requestedStatus =
    body.status === "PUBLISHED" || body.status === "SCHEDULED" ? body.status : "DRAFT";
  const status = canPublishBlog(session!.user.role) ? requestedStatus : "DRAFT";
  const scheduledAt = status === "SCHEDULED" && body.scheduledAt ? parseIstanbulDateTime(body.scheduledAt) : null;
  const authorName = normalizeAuthorName(body.authorName);

  const post = await prisma.blogPost.create({
    data: {
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt,
      content: body.content,
      coverImage: body.coverImage || null,
      tags: parseTags(body.tags),
      authorName,
      authorSlug: toAuthorSlug(authorName),
      createdByUserId: session!.user.id,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
      status,
      scheduledAt,
      seoTitle: body.seoTitle || null,
      seoDescription: body.seoDescription || null,
      canonicalUrl: body.canonicalUrl || null,
      ogTitle: body.ogTitle || null,
      ogDescription: body.ogDescription || null,
      ogImage: body.ogImage || null,
      noIndex: Boolean(body.noIndex),
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
