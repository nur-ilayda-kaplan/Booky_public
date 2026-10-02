import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/adminGuard";

export async function POST(request: Request) {
  const { response } = await requireSuperAdmin();
  if (response) return response;

  const body = await request.json().catch(() => null);
  if (!body?.menu || !body?.labelTr || !body?.url) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const item = await prisma.menuItem.create({
    data: {
      menu: body.menu,
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

  return NextResponse.json({ item }, { status: 201 });
}
