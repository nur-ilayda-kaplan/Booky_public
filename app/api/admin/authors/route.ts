import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCmsAccess } from "@/lib/adminGuard";

export async function GET() {
  const { response } = await requireCmsAccess();
  if (response) return response;

  const authors = await prisma.author.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ authors });
}

export async function POST(request: Request) {
  const { response } = await requireCmsAccess();
  if (response) return response;

  const body = await request.json().catch(() => null);
  if (!body?.name || !body?.slug) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const existing = await prisma.author.findUnique({ where: { slug: body.slug } });
  if (existing) {
    return NextResponse.json({ error: "SLUG_TAKEN" }, { status: 409 });
  }

  const author = await prisma.author.create({
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

  return NextResponse.json({ author }, { status: 201 });
}
