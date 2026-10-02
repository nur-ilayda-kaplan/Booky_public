import { notFound } from "next/navigation";
import { requireCmsSession } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";
import { AuthorForm } from "./AuthorForm";

export const metadata = { title: "Yazar Düzenle" };

export default async function AdminAuthorEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireCmsSession("/admin/authors");
  const { id } = await params;

  if (id === "new") {
    return (
      <div>
        <h2 className="mb-6 text-lg font-semibold">Yeni Yazar</h2>
        <AuthorForm initial={null} />
      </div>
    );
  }

  const author = await prisma.author.findUnique({ where: { id } });
  if (!author) notFound();

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">Yazarı Düzenle</h2>
      <AuthorForm initial={author} />
    </div>
  );
}
