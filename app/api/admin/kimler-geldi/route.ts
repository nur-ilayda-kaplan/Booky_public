import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCmsAccess } from "@/lib/adminGuard";
import { parseGalleryBody } from "@/lib/parseGalleryBody";

export async function POST(request: Request) {
  const { response } = await requireCmsAccess();
  if (response) return response;

  const parsed = await parseGalleryBody(await request.json().catch(() => null));
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: parsed.status });

  if (parsed.data.eventId) {
    const taken = await prisma.eventGallery.findUnique({ where: { eventId: parsed.data.eventId } });
    if (taken) return NextResponse.json({ error: "EVENT_TAKEN" }, { status: 409 });
  }

  const gallery = await prisma.eventGallery.create({ data: parsed.data });
  return NextResponse.json({ gallery }, { status: 201 });
}
