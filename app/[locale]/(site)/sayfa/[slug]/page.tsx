import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/config/i18n.config";
import { buildMetadata } from "@/lib/buildMetadata";
import { getPublishedPageBySlug } from "@/lib/services/pages";
import { LegalPageContent } from "@/components/legal/LegalPageContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "tr";
  const page = await getPublishedPageBySlug(slug);

  if (!page) {
    return buildMetadata({ locale, path: `/sayfa/${slug}`, title: "Booky", description: "" });
  }

  return buildMetadata({
    locale,
    path: `/sayfa/${page.slug}`,
    title: page.seoTitle || page.title,
    description: page.seoDescription || page.content.slice(0, 160),
    ogTitle: page.ogTitle,
    ogDescription: page.ogDescription,
    image: page.ogImage ?? undefined,
    canonicalUrl: page.canonicalUrl ?? undefined,
    noIndex: page.noIndex,
  });
}

export default async function CmsPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();

  const page = await getPublishedPageBySlug(slug);
  if (!page) notFound();

  return <LegalPageContent title={page.title} content={page.content} />;
}
