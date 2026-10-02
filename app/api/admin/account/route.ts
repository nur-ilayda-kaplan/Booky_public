import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { comparePassword, hashPassword } from "@/lib/password";
import { isAdminPanelRole } from "@/lib/adminGuard";

// Yönetim paneline giriş yapmış kullanıcının (hangi rolde olursa olsun) kendi
// hesabındaki isim, e-posta ve şifreyi değiştirmesi için. Diğer kullanıcıları
// etkilemez — her zaman oturumdaki kullanıcının kendi kaydı güncellenir.
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !isAdminPanelRole(session.user.role)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const { name, email, currentPassword, newPassword } = body as {
    name?: unknown;
    email?: unknown;
    currentPassword?: unknown;
    newPassword?: unknown;
  };

  if (typeof currentPassword !== "string" || !currentPassword) {
    return NextResponse.json({ error: "MISSING_CURRENT_PASSWORD" }, { status: 400 });
  }
  if (typeof email !== "string" || !email.trim() || !email.includes("@")) {
    return NextResponse.json({ error: "INVALID_EMAIL" }, { status: 400 });
  }
  if (newPassword !== undefined && (typeof newPassword !== "string" || newPassword.length < 8)) {
    return NextResponse.json({ error: "INVALID_NEW_PASSWORD" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const isValid = await comparePassword(currentPassword, user.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: "WRONG_PASSWORD" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing && existing.id !== user.id) {
      return NextResponse.json({ error: "EMAIL_TAKEN" }, { status: 409 });
    }
  }

  const data: { name?: string; email?: string; passwordHash?: string } = {
    email: normalizedEmail,
  };
  if (typeof name === "string" && name.trim()) {
    data.name = name.trim();
  }
  if (typeof newPassword === "string" && newPassword) {
    data.passwordHash = await hashPassword(newPassword);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json({ user: updated });
}
