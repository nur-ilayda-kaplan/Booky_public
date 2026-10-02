import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/config/i18n.config";
import { getDictionary } from "@/lib/getDictionary";
import { buildMetadata } from "@/lib/buildMetadata";
import { getProducts } from "@/lib/services/products";
import { getCategories } from "@/lib/services/categories";
import { getAuthors } from "@/lib/services/authors";
import { BookstoreClient } from "@/components/product/BookstoreClient";
import { PageContainer } from "@/components/layout/PageContainer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "tr";
  const dict = getDictionary(locale);

  return buildMetadata({
    locale,
    path: "/bookstore",
    title: dict.nav.bookstore,
    description: dict.home.featuredBooksSubtitle,
  });
}

export default async function BookstorePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);
  const { category } = await searchParams;

  const [products, categories, authors] = await Promise.all([
    getProducts(),
    getCategories(),
    getAuthors(),
  ]);

  return (
    <PageContainer className="py-12">
      <h1 className="mb-8 font-serif text-3xl font-semibold">{dict.nav.bookstore}</h1>
      <BookstoreClient
        products={products}
        categories={categories}
        authors={authors}
        locale={locale}
        dict={dict}
        initialCategory={category}
      />
    </PageContainer>
  );
}
