import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProductAccess } from "@/lib/adminGuard";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireProductAccess();
  if (response) return response;

  const { id: productId } = await params;
  const body = await request.json().catch(() => null);
  if (!body?.platform || !body?.url) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const link = await prisma.salesLink.create({
    data: {
      productId,
      platform: body.platform,
      label: body.label || "Satın Al",
      url: body.url,
      order: Number.isInteger(body.order) ? body.order : 0,
      active: body.active ?? true,
    },
  });

  return NextResponse.json({ link }, { status: 201 });
}
