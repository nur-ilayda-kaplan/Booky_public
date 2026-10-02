import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProductAccess } from "@/lib/adminGuard";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; linkId: string }> },
) {
  const { response } = await requireProductAccess();
  if (response) return response;

  const { linkId } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.platform === "string") data.platform = body.platform;
  if (typeof body.label === "string") data.label = body.label;
  if (typeof body.url === "string") data.url = body.url;
  if (typeof body.order === "number") data.order = body.order;
  if (typeof body.active === "boolean") data.active = body.active;

  const link = await prisma.salesLink.update({ where: { id: linkId }, data });

  return NextResponse.json({ link });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; linkId: string }> },
) {
  const { response } = await requireProductAccess();
  if (response) return response;

  const { linkId } = await params;
  await prisma.salesLink.delete({ where: { id: linkId } });

  return NextResponse.json({ ok: true });
}
