import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/adminGuard";
import type { Role } from "@prisma/client";

const VALID_ROLES: Role[] = ["SUPER_ADMIN", "BLOG_MANAGER", "BLOG_AUTHOR", "PRODUCT_MANAGER", "CUSTOMER"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireSuperAdmin();
  if (response) return response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const role = body?.role;

  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: "INVALID_ROLE" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!target) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  if (target.role === "SUPER_ADMIN" && role !== "SUPER_ADMIN") {
    const superAdminCount = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });
    if (superAdminCount <= 1) {
      return NextResponse.json({ error: "LAST_SUPER_ADMIN" }, { status: 409 });
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, role: true },
  });

  return NextResponse.json({ user: updated });
}
