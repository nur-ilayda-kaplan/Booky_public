import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/adminGuard";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireSuperAdmin();
  if (response) return response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body?.labelTr || !body?.url) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  if (body.parentId === id) {
    return NextResponse.json({ error: "SELF_PARENT" }, { status: 400 });
  }

  const item = await prisma.menuItem.update({
    where: { id },
    data: {
      labelTr: body.labelTr,
      labelEn: body.labelEn || null,
      linkType: body.linkType || "EXTERNAL",
      url: body.url,
      parentId: body.parentId || null,
      order: Number.isInteger(body.order) ? body.order : 0,
      active: body.active ?? true,
      showOnMobile: body.showOnMobile ?? true,
      openInNewTab: Boolean(body.openInNewTab),
    },
  });

  return NextResponse.json({ item });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireSuperAdmin();
  if (response) return response;

  const { id } = await params;
  await prisma.menuItem.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
