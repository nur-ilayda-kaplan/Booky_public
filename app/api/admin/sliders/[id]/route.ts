import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/adminGuard";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireSuperAdmin();
  if (response) return response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body?.imageDesktop || !body?.titleTr) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const slider = await prisma.slider.update({
    where: { id },
    data: {
      imageDesktop: body.imageDesktop,
      imageMobile: body.imageMobile || null,
      imagePosition: body.imagePosition || "center",
      titleTr: body.titleTr,
      titleEn: body.titleEn || null,
      subtitleTr: body.subtitleTr || null,
      subtitleEn: body.subtitleEn || null,
      descriptionTr: body.descriptionTr || null,
      descriptionEn: body.descriptionEn || null,
      ctaHref: body.ctaHref || null,
      ctaLabelTr: body.ctaLabelTr || null,
      ctaLabelEn: body.ctaLabelEn || null,
      order: Number.parseInt(body.order, 10) || 0,
      active: body.active ?? true,
    },
  });

  return NextResponse.json({ slider });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireSuperAdmin();
  if (response) return response;

  const { id } = await params;
  await prisma.slider.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
