import Link from "next/link";
import { requireBlogSession, shouldScopeBlogPostsToOwner } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const metadata = { title: "Blog" };

export default async function AdminBlogListPage() {
  const session = await requireBlogSession("/admin/blog");

  // BLOG_AUTHOR normalde sadece kendi yazdığı yazıları görür; SUPER_ADMIN/BLOG_MANAGER hepsini görür.
  const posts = await prisma.blogPost.findMany({
    where: shouldScopeBlogPostsToOwner(session.user.role) ? { createdByUserId: session.user.id } : undefined,
    orderBy: { updatedAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Blog Yazıları ({posts.length})</h2>
        <Link
          href="/admin/blog/new"
          className="rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Yeni Yazı
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-black/[0.02] text-xs uppercase tracking-wide text-foreground/60">
            <tr>
              <th className="px-4 py-3">Başlık</th>
              <th className="px-4 py-3">Yazar</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Güncellendi</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/blog/${post.id}`} className="font-medium hover:underline">
                    {post.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-foreground/60">{post.authorName ?? post.author?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={post.status} scheduledAt={post.scheduledAt} />
                </td>
                <td className="px-4 py-3 text-foreground/50">
                  {post.updatedAt.toLocaleDateString("tr-TR")}
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-foreground/40">
                  Henüz blog yazısı eklenmedi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
