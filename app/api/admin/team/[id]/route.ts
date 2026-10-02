import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCmsAccess } from "@/lib/adminGuard";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireCmsAccess();
  if (response) return response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body?.name || !body?.role) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const current = await prisma.teamMember.findUnique({ where: { id } });
  if (!current) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const member = await prisma.teamMember.update({
    where: { id },
    data: {
      name: body.name,
      role: body.role,
      photo: body.photo || null,
      bio: body.bio || null,
      order: Number.parseInt(body.order, 10) || 0,
    },
  });

  return NextResponse.json({ member });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireCmsAccess();
  if (response) return response;

  const { id } = await params;

  const current = await prisma.teamMember.findUnique({ where: { id } });
  if (!current) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  await prisma.teamMember.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
