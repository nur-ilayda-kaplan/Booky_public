import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCmsAccess } from "@/lib/adminGuard";

export async function GET() {
  const { response } = await requireCmsAccess();
  if (response) return response;

  const mentions = await prisma.pressMention.findMany({ orderBy: { publishedAt: "desc" } });
  return NextResponse.json({ mentions });
}

export async function POST(request: Request) {
  const { response } = await requireCmsAccess();
  if (response) return response;

  const body = await request.json().catch(() => null);
  if (!body?.title || !body?.source || !body?.url || !body?.excerpt || !body?.publishedAt) {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const mention = await prisma.pressMention.create({
    data: {
      title: body.title,
      source: body.source,
      url: body.url,
      excerpt: body.excerpt,
      publishedAt: new Date(body.publishedAt),
    },
  });

  return NextResponse.json({ mention }, { status: 201 });
}
