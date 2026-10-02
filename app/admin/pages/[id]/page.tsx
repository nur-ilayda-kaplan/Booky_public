import { notFound } from "next/navigation";
import { requireSuperAdminSession } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";
import { PageForm } from "./PageForm";

export const metadata = { title: "Sayfa Düzenle" };

export default async function AdminPageEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSuperAdminSession("/admin/pages");
  const { id } = await params;

  if (id === "new") {
    return (
      <div>
        <h2 className="mb-6 text-lg font-semibold">Yeni Sayfa</h2>
        <PageForm initial={null} canPublish={true} />
      </div>
    );
  }

  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) notFound();

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">Sayfayı Düzenle</h2>
      <PageForm initial={page} canPublish={true} />
    </div>
  );
}
