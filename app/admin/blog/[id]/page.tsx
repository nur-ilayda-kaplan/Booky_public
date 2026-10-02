import { notFound } from "next/navigation";
import { requireBlogSession, canPublishBlog, canEditBlogPost } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";
import { pickAuthorOptions } from "@/lib/blogAuthor";
import { BlogForm } from "./BlogForm";

export const metadata = { title: "Blog Yazısı Düzenle" };

export default async function AdminBlogEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireBlogSession("/admin/blog");
  const { id } = await params;

  const canPublish = canPublishBlog(session.user.role);

  // Yazar kutusundaki öneriler: her slug için en çok kullanılan yazım.
  const authorGroups = await prisma.blogPost.groupBy({
    by: ["authorSlug", "authorName"],
    where: { authorSlug: { not: null }, authorName: { not: null } },
    _count: { _all: true },
  });
  const authorOptions = pickAuthorOptions(
    authorGroups.map((group) => ({
      slug: group.authorSlug!,
      name: group.authorName!,
      count: group._count._all,
    })),
  );

  if (id === "new") {
    return (
      <div>
        <h2 className="mb-6 text-lg font-semibold">Yeni Blog Yazısı</h2>
        <BlogForm initial={null} canPublish={canPublish} authorOptions={authorOptions} />
      </div>
    );
  }

  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  // BLOG_AUTHOR normalde sadece kendi yazdığı yazıyı düzenleyebilir.
  if (!canEditBlogPost(session.user.role, post.createdByUserId, session.user.id)) {
    notFound();
  }

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">Blog Yazısını Düzenle</h2>
      <BlogForm initial={post} canPublish={canPublish} authorOptions={authorOptions} />
    </div>
  );
}
