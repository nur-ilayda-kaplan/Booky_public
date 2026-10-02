import Link from "next/link";
import { ADMIN_PANEL_ROLES, requireSuperAdminSession } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";
import { UserRoleToggle } from "./UserRoleToggle";
import { ROLE_LABELS } from "./roleLabels";

export const metadata = { title: "Kullanıcılar" };

export default async function AdminUsersPage() {
  await requireSuperAdminSession("/admin/users");

  // Sadece staff rolleri (SUPER_ADMIN/BLOG_MANAGER/BLOG_AUTHOR/PRODUCT_MANAGER)
  // — müşteri hesapları (CUSTOMER) için ayrı /admin/customers sayfası var.
  const users = await prisma.user.findMany({
    where: { role: { in: ADMIN_PANEL_ROLES } },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const superAdminCount = users.filter((user) => user.role === "SUPER_ADMIN").length;

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">Kullanıcılar ({users.length})</h2>
      <div className="overflow-x-auto rounded-lg border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-black/[0.02] text-xs uppercase tracking-wide text-foreground/60">
            <tr>
              <th className="px-4 py-3">İsim</th>
              <th className="px-4 py-3">E-posta</th>
              <th className="px-4 py-3">Kayıt Tarihi</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="font-medium hover:underline"
                    title="İsmi düzenle"
                  >
                    {user.name}
                  </Link>
                </td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.createdAt.toLocaleDateString("tr-TR")}</td>
                <td className="px-4 py-3">
                  <span className={user.role === "SUPER_ADMIN" ? "font-medium text-brand-primary" : ""}>
                    {ROLE_LABELS[user.role]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <UserRoleToggle
                    userId={user.id}
                    role={user.role}
                    isLastSuperAdmin={user.role === "SUPER_ADMIN" && superAdminCount === 1}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
