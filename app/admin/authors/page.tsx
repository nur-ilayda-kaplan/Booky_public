import Image from "next/image";
import Link from "next/link";
import { requireCmsSession } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Yazarlar" };

export default async function AdminAuthorsListPage() {
  await requireCmsSession("/admin/authors");

  const authors = await prisma.author.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Yazarlar ({authors.length})</h2>
        <Link
          href="/admin/authors/new"
          className="rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Yeni Yazar Ekle
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-black/[0.02] text-xs uppercase tracking-wide text-foreground/60">
            <tr>
              <th className="px-4 py-3">Fotoğraf</th>
              <th className="px-4 py-3">İsim</th>
              <th className="px-4 py-3">Slug</th>
            </tr>
          </thead>
          <tbody>
            {authors.map((author) => (
              <tr key={author.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-brand-accent/20">
                    {author.photo && (
                      <Image src={author.photo} alt={author.name} fill sizes="40px" className="object-cover" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/authors/${author.id}`} className="font-medium hover:underline">
                    {author.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-foreground/50">{author.slug}</td>
              </tr>
            ))}
            {authors.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-foreground/40">
                  Henüz yazar eklenmedi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
