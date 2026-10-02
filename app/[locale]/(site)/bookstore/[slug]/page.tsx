import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/config/i18n.config";
import { getDictionary } from "@/lib/getDictionary";
import { localePath } from "@/lib/localePath";
import { formatPrice } from "@/lib/formatPrice";
import { buildMetadata } from "@/lib/buildMetadata";
import { getProductBySlug, getProductsByAuthor } from "@/lib/services/products";
import { getAuthorById } from "@/lib/services/authors";
import { getCategoryById } from "@/lib/services/categories";
import { getFrequentlyBoughtTogether } from "@/lib/services/recommendations";
import { getActiveSalesLinksBySlug } from "@/lib/services/salesLinks";
import { ProductDetailActions } from "@/components/product/ProductDetailActions";
import { ProductCard } from "@/components/product/ProductCard";
import { RecommendedProducts } from "@/components/product/RecommendedProducts";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageContainer } from "@/components/layout/PageContainer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "tr";
  const product = await getProductBySlug(slug);

  if (!product) {
    return buildMetadata({ locale, path: `/bookstore/${slug}`, title: "Booky", description: "" });
  }

  return buildMetadata({
    locale,
    path: `/bookstore/${product.slug}`,
    title: product.seoTitle || product.title,
    description: product.seoDescription || product.description,
    ogTitle: product.ogTitle,
    ogDescription: product.ogDescription,
    image: product.ogImage || product.coverImage,
    canonicalUrl: product.canonicalUrl,
    noIndex: product.noIndex,
  });
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [author, category, otherBooks, recommendations, salesLinks] = await Promise.all([
    getAuthorById(product.authorId),
    getCategoryById(product.categoryId),
    getProductsByAuthor(product.authorId).then((books) =>
      books.filter((book) => book.id !== product.id),
    ),
    getFrequentlyBoughtTogether(product.id, 4),
    getActiveSalesLinksBySlug(product.slug),
  ]);

  const showPrice = product.showPrice !== false;

  return (
    <PageContainer className="py-12">
      <div className="grid gap-10 lg:grid-cols-[360px_1fr]">
        <div className="relative aspect-2/3 w-full overflow-hidden rounded-lg bg-brand-accent/20">
          {product.coverImage && (
            <Image
              src={product.coverImage}
              alt={product.title}
              fill
              sizes="(min-width: 1024px) 360px, 90vw"
              className="object-cover"
              priority
            />
          )}
        </div>

        <div className="flex flex-col gap-4">
          {category && (
            <span className="text-sm font-semibold uppercase tracking-wide text-brand-primary">
              {category.name[locale]}
            </span>
          )}
          <h1 className="font-serif text-3xl font-semibold">{product.title}</h1>
          {author && (
            <Link
              href={localePath(locale, `/yayinevi/yazarlarimiz/${author.slug}`)}
              className="text-base text-foreground/60 hover:text-brand-primary"
            >
              {author.name}
            </Link>
          )}

          {showPrice && (
            <div className="flex items-center gap-4">
              <span className="text-2xl font-semibold">{formatPrice(product.price, locale)}</span>
            </div>
          )}

          <p className="leading-relaxed text-foreground/80">{product.description}</p>

          <ProductDetailActions salesLinks={salesLinks} dict={dict} />

          <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg border border-black/5 bg-brand-accent/10 p-4 text-base sm:grid-cols-3">
            {product.publisher && (
              <div>
                <p className="text-foreground/50">{dict.product.publisher}</p>
                <p className="font-medium">{product.publisher}</p>
              </div>
            )}
            <div>
              <p className="text-foreground/50">{dict.product.isbn}</p>
              <p className="font-medium">{product.isbn}</p>
            </div>
            <div>
              <p className="text-foreground/50">{dict.product.pageCount}</p>
              <p className="font-medium">{product.pageCount}</p>
            </div>
            <div>
              <p className="text-foreground/50">{dict.product.publishedYear}</p>
              <p className="font-medium">{product.publishedYear}</p>
            </div>
          </div>
        </div>
      </div>

      <RecommendedProducts
        title={dict.product.frequentlyBoughtTogether}
        products={recommendations}
        locale={locale}
        dict={dict}
      />

      {otherBooks.length > 0 && (
        <section className="mt-16">
          <SectionHeading title={dict.product.relatedBy} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {otherBooks.map((book) => (
              <ProductCard key={book.id} product={book} locale={locale} dict={dict} />
            ))}
          </div>
        </section>
      )}
    </PageContainer>
  );
}
