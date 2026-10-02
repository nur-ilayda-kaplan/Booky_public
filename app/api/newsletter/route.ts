import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  try {
    await prisma.newsletterSubscriber.create({ data: { email } });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      // Already subscribed — treat as success so the form doesn't need to distinguish this case.
      return NextResponse.json({ success: true }, { status: 200 });
    }
    throw error;
  }
}
