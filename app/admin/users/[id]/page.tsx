import { notFound } from "next/navigation";
import Link from "next/link";
import { requireSuperAdminSession } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";
import { ROLE_LABELS } from "../roleLabels";
import { UserNameForm } from "./UserNameForm";

export const metadata = { title: "Kullanıcı Detayı" };

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSuperAdminSession("/admin/users");
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) notFound();

  return (
    <div>
      <p className="mb-4">
        <Link href="/admin/users" className="text-sm text-brand-primary hover:underline">
          ← Kullanıcılara dön
        </Link>
      </p>
      <h2 className="mb-1 text-lg font-semibold">{user.name}</h2>
      <p className="mb-6 text-sm text-foreground/60">
        {user.email} · {ROLE_LABELS[user.role]}
      </p>

      <UserNameForm userId={user.id} initialName={user.name} />
    </div>
  );
}
