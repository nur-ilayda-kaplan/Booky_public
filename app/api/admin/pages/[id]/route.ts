import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseIstanbulDateTime } from "@/lib/formatDate";
import { requireSuperAdmin } from "@/lib/adminGuard";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireSuperAdmin();
  if (response) return response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body?.title || !body?.slug) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const existing = await prisma.page.findUnique({ where: { slug: body.slug } });
  if (existing && existing.id !== id) {
    return NextResponse.json({ error: "SLUG_TAKEN" }, { status: 409 });
  }

  // Bu route'a sadece SUPER_ADMIN ulaşabilir (requireSuperAdmin), o yüzden
  // yayınlama yetkisi ekstra bir kontrol gerektirmiyor.
  const status = body.status === "PUBLISHED" || body.status === "SCHEDULED" ? body.status : "DRAFT";
  const scheduledAt = status === "SCHEDULED" && body.scheduledAt ? parseIstanbulDateTime(body.scheduledAt) : null;

  const page = await prisma.page.update({
    where: { id },
    data: {
      title: body.title,
      slug: body.slug,
      content: body.content ?? "",
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

  return NextResponse.json({ page });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireSuperAdmin();
  if (response) return response;

  const { id } = await params;
  await prisma.page.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
