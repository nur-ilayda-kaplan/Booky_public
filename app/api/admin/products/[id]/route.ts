import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseIstanbulDateTime } from "@/lib/formatDate";
import { requireProductAccess, canPublishProduct } from "@/lib/adminGuard";

function toIntOrNull(value: unknown): number | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function toFloatOrNull(value: unknown): number | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireProductAccess();
  if (response) return response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body?.title || !body?.slug) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({ where: { slug: body.slug } });
  if (existing && existing.id !== id) {
    return NextResponse.json({ error: "SLUG_TAKEN" }, { status: 409 });
  }

  const requestedStatus =
    body.status === "PUBLISHED" || body.status === "SCHEDULED" ? body.status : "DRAFT";
  const status = canPublishProduct(session!.user.role) ? requestedStatus : "DRAFT";
  const scheduledAt = status === "SCHEDULED" && body.scheduledAt ? parseIstanbulDateTime(body.scheduledAt) : null;

  const product = await prisma.product.update({
    where: { id },
    data: {
      title: body.title,
      slug: body.slug,
      isbn: body.isbn || null,
      publisher: body.publisher || null,
      description: body.description || null,
      coverImage: body.coverImage || null,
      pageCount: toIntOrNull(body.pageCount),
      publishedYear: toIntOrNull(body.publishedYear),
      price: toFloatOrNull(body.price),
      showPrice: Boolean(body.showPrice),
      featured: Boolean(body.featured),
      authorId: body.authorId || null,
      categoryId: body.categoryId || null,
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

  return NextResponse.json({ product });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireProductAccess();
  if (response) return response;

  const { id } = await params;
  await prisma.product.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
