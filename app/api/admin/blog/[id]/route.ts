import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseIstanbulDateTime } from "@/lib/formatDate";
import { normalizeAuthorName, toAuthorSlug } from "@/lib/blogAuthor";
import { requireBlogAccess, canPublishBlog, canEditBlogPost } from "@/lib/adminGuard";

function parseTags(input: unknown): string[] {
  if (typeof input !== "string") return [];
  return input
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireBlogAccess();
  if (response) return response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body?.title || !body?.slug || !body?.excerpt || !body?.content) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const current = await prisma.blogPost.findUnique({ where: { id } });
  if (!current) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  // BLOG_AUTHOR normalde sadece kendi yazdığı yazıyı güncelleyebilir.
  if (!canEditBlogPost(session!.user.role, current.createdByUserId, session!.user.id)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const existing = await prisma.blogPost.findUnique({ where: { slug: body.slug } });
  if (existing && existing.id !== id) {
    return NextResponse.json({ error: "SLUG_TAKEN" }, { status: 409 });
  }

  const requestedStatus =
    body.status === "PUBLISHED" || body.status === "SCHEDULED" ? body.status : "DRAFT";
  const status = canPublishBlog(session!.user.role) ? requestedStatus : "DRAFT";
  const scheduledAt = status === "SCHEDULED" && body.scheduledAt ? parseIstanbulDateTime(body.scheduledAt) : null;
  const authorName = normalizeAuthorName(body.authorName);

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt,
      content: body.content,
      coverImage: body.coverImage || null,
      tags: parseTags(body.tags),
      // Yazar adı artık elle giriliyor; eski Author ilişkisi temizlenir.
      authorId: null,
      authorName,
      authorSlug: toAuthorSlug(authorName),
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

  return NextResponse.json({ post });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireBlogAccess();
  if (response) return response;

  const { id } = await params;

  const current = await prisma.blogPost.findUnique({ where: { id }, select: { createdByUserId: true } });
  if (!current) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  // BLOG_AUTHOR normalde sadece kendi yazdığı yazıyı silebilir.
  if (!canEditBlogPost(session!.user.role, current.createdByUserId, session!.user.id)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  await prisma.blogPost.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
