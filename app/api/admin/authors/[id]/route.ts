import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCmsAccess } from "@/lib/adminGuard";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireCmsAccess();
  if (response) return response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body?.name || !body?.slug) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const current = await prisma.author.findUnique({ where: { id } });
  if (!current) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const existing = await prisma.author.findUnique({ where: { slug: body.slug } });
  if (existing && existing.id !== id) {
    return NextResponse.json({ error: "SLUG_TAKEN" }, { status: 409 });
  }

  const author = await prisma.author.update({
    where: { id },
    data: {
      name: body.name,
      slug: body.slug,
      photo: body.photo || null,
      shortBio: body.shortBio || null,
      bio: body.bio || null,
      socialInstagram: body.socialInstagram || null,
      socialTwitter: body.socialTwitter || null,
      socialWebsite: body.socialWebsite || null,
      spotifyPlaylistUrl: body.spotifyPlaylistUrl || null,
    },
  });

  return NextResponse.json({ author });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireCmsAccess();
  if (response) return response;

  const { id } = await params;

  const current = await prisma.author.findUnique({ where: { id } });
  if (!current) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  await prisma.author.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
