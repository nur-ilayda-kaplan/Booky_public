import { requireProductSession } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";
import { ProductsListClient } from "./ProductsListClient";

export const metadata = { title: "Kitaplar" };

export default async function AdminProductsListPage() {
  await requireProductSession("/admin/products");

  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return <ProductsListClient products={products} />;
}
