import Link from "next/link";
import { requireSuperAdminSession } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const metadata = { title: "Sayfalar" };

export default async function AdminPagesListPage() {
  await requireSuperAdminSession("/admin/pages");

  const pages = await prisma.page.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Sayfalar ({pages.length})</h2>
        <Link
          href="/admin/pages/new"
          className="rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Yeni Sayfa
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-black/[0.02] text-xs uppercase tracking-wide text-foreground/60">
            <tr>
              <th className="px-4 py-3">Başlık</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Güncellendi</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/pages/${page.id}`} className="font-medium hover:underline">
                    {page.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-foreground/60">/{page.slug}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={page.status} scheduledAt={page.scheduledAt} />
                </td>
                <td className="px-4 py-3 text-foreground/50">
                  {page.updatedAt.toLocaleDateString("tr-TR")}
                </td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-foreground/40">
                  Henüz sayfa eklenmedi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
