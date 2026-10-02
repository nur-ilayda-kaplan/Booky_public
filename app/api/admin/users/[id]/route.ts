import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/adminGuard";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireSuperAdmin();
  if (response) return response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const name = body?.name;

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "INVALID_NAME" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!target) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { name: name.trim() },
    select: { id: true, name: true },
  });

  return NextResponse.json({ user: updated });
}
