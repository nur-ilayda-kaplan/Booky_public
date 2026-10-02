import { notFound } from "next/navigation";
import { requireProductSession, canPublishProduct } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "./ProductForm";
import { SalesLinksManager } from "./SalesLinksManager";

export const metadata = { title: "Kitap Düzenle" };

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireProductSession("/admin/products");
  const { id } = await params;

  const [authors, categories] = await Promise.all([
    prisma.author.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.category.findMany({ orderBy: { nameTr: "asc" }, select: { id: true, nameTr: true } }),
  ]);

  const canPublish = canPublishProduct(session.user.role);

  if (id === "new") {
    return (
      <div>
        <h2 className="mb-6 text-lg font-semibold">Yeni Kitap</h2>
        <ProductForm initial={null} authors={authors} categories={categories} canPublish={canPublish} />
      </div>
    );
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: { salesLinks: { orderBy: { order: "asc" } } },
  });
  if (!product) notFound();

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">Kitabı Düzenle</h2>
      <ProductForm initial={product} authors={authors} categories={categories} canPublish={canPublish} />
      <div className="mt-8 max-w-2xl">
        <SalesLinksManager productId={product.id} initialLinks={product.salesLinks} />
      </div>
    </div>
  );
}
