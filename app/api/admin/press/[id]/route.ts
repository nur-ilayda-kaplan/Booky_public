import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCmsAccess } from "@/lib/adminGuard";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireCmsAccess();
  if (response) return response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body?.title || !body?.source || !body?.url || !body?.excerpt || !body?.publishedAt) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const current = await prisma.pressMention.findUnique({ where: { id } });
  if (!current) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const mention = await prisma.pressMention.update({
    where: { id },
    data: {
      title: body.title,
      source: body.source,
      url: body.url,
      excerpt: body.excerpt,
      publishedAt: new Date(body.publishedAt),
    },
  });

  return NextResponse.json({ mention });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireCmsAccess();
  if (response) return response;

  const { id } = await params;

  const current = await prisma.pressMention.findUnique({ where: { id } });
  if (!current) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  await prisma.pressMention.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
