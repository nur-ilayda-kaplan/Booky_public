import type { Metadata } from "next";
import type { Locale } from "@/config/i18n.config";
import { getSiteSettings } from "@/lib/services/siteSettings";
import { localePath } from "@/lib/localePath";

export async function buildMetadata({
  locale,
  path,
  title,
  description,
  ogTitle,
  ogDescription,
  image,
  canonicalUrl,
  noIndex,
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  ogTitle?: string | null;
  ogDescription?: string | null;
  image?: string | null;
  canonicalUrl?: string;
  noIndex?: boolean;
}): Promise<Metadata> {
  const settings = await getSiteSettings();
  const canonical = canonicalUrl || localePath(locale, path);

  // Öncelik: içerik bazlı OG alanı > içerik bazlı SEO title/description
  // (zaten `title`/`description` içine düşürülmüş olarak gelir) > site
  // geneli varsayılanlar (admin > Genel Ayarlar).
  const resolvedOgTitle = ogTitle || title || settings.seoTitleDefault || undefined;
  const resolvedOgDescription = ogDescription || description || settings.seoDescriptionDefault || undefined;
  const resolvedImage = image || settings.ogImageDefault || undefined;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: resolvedOgTitle,
      description: resolvedOgDescription,
      url: canonical,
      locale: locale === "tr" ? "tr_TR" : "en_US",
      type: "website",
      images: resolvedImage ? [{ url: resolvedImage }] : undefined,
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
