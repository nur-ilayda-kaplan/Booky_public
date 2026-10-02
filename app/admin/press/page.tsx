import Link from "next/link";
import { requireCmsSession } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/formatDate";

export const metadata = { title: "Basında Booky" };

export default async function AdminPressListPage() {
  await requireCmsSession("/admin/press");

  const mentions = await prisma.pressMention.findMany({ orderBy: { publishedAt: "desc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Basında Booky ({mentions.length})</h2>
        <Link
          href="/admin/press/new"
          className="rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Yeni Haber Ekle
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-black/[0.02] text-xs uppercase tracking-wide text-foreground/60">
            <tr>
              <th className="px-4 py-3">Başlık</th>
              <th className="px-4 py-3">Kaynak</th>
              <th className="px-4 py-3">Tarih</th>
            </tr>
          </thead>
          <tbody>
            {mentions.map((mention) => (
              <tr key={mention.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/press/${mention.id}`} className="font-medium hover:underline">
                    {mention.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-foreground/50">{mention.source}</td>
                <td className="px-4 py-3 text-foreground/50">
                  {formatDate(mention.publishedAt.toISOString(), "tr")}
                </td>
              </tr>
            ))}
            {mentions.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-foreground/40">
                  Henüz basın haberi eklenmedi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
