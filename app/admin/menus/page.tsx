import { requireSuperAdminSession } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";
import { getPublishedPagesForMenu } from "@/lib/services/pages";
import {
  MenuItemsManager,
  type InternalPageOption,
  type CategoryOption,
} from "./MenuItemsManager";

export const metadata = { title: "Menüler" };

const STATIC_INTERNAL_PAGES: InternalPageOption[] = [
  { value: "/", label: "Ana Sayfa" },
  { value: "/bookstore", label: "Kitabevi (Ürünler)" },
  { value: "/kitabevi/hakkimizda", label: "Kitabevi — Hakkımızda" },
  { value: "/kitabevi/blog", label: "Blog" },
  { value: "/kitabevi/etkinlikler", label: "Etkinlikler" },
  { value: "/kitabevi/kimler-geldi", label: "Kimler Geldi" },
  { value: "/yayinevi/biz-kimiz", label: "Yayınevi — Biz Kimiz" },
  { value: "/yayinevi/yazarlarimiz", label: "Booky'de Kimler Var" },
  { value: "/contact", label: "İletişim" },
  { value: "/press", label: "Basın" },
];

export default async function AdminMenusPage() {
  await requireSuperAdminSession("/admin/menus");

  const [
    mainItems,
    footerItems,
    publishedPages,
    productCategories,
  ] = await Promise.all([
    prisma.menuItem.findMany({
      where: { menu: "MAIN" },
      orderBy: { order: "asc" },
    }),
    prisma.menuItem.findMany({
      where: { menu: "FOOTER" },
      orderBy: { order: "asc" },
    }),
    getPublishedPagesForMenu(),
    prisma.category.findMany({
      select: { slug: true, nameTr: true },
      orderBy: { nameTr: "asc" },
    }),
  ]);

  const internalPages: InternalPageOption[] = [
    ...STATIC_INTERNAL_PAGES,
    ...publishedPages.map((page) => ({
      value: `/sayfa/${page.slug}`,
      label: page.title,
    })),
  ];

  const productCategoryOptions: CategoryOption[] = productCategories.map(
    (category) => ({
      value: category.slug,
      label: category.nameTr,
    }),
  );

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h2 className="mb-4 text-lg font-semibold">Ana Menü</h2>
        <MenuItemsManager
          menu="MAIN"
          initialItems={mainItems}
          internalPages={internalPages}
          productCategories={productCategoryOptions}
        />
      </div>
      <div>
        <h2 className="mb-4 text-lg font-semibold">Footer Menüsü</h2>
        <MenuItemsManager
          menu="FOOTER"
          initialItems={footerItems}
          internalPages={internalPages}
          productCategories={productCategoryOptions}
        />
      </div>
    </div>
  );
}
