import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCmsAccess } from "@/lib/adminGuard";

export async function GET() {
  const { response } = await requireCmsAccess();
  if (response) return response;

  const team = await prisma.teamMember.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ team });
}

export async function POST(request: Request) {
  const { response } = await requireCmsAccess();
  if (response) return response;

  const body = await request.json().catch(() => null);
  if (!body?.name || !body?.role) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const member = await prisma.teamMember.create({
    data: {
      name: body.name,
      role: body.role,
      photo: body.photo || null,
      bio: body.bio || null,
      order: Number.parseInt(body.order, 10) || 0,
    },
  });

  return NextResponse.json({ member }, { status: 201 });
}
