import type { Metadata } from "next";
import { Literata, Mulish, Young_Serif } from "next/font/google";
import { notFound } from "next/navigation";
import { locales, isLocale, type Locale } from "@/config/i18n.config";
import { siteConfig } from "@/config/site.config";
import { getSiteSettings } from "@/lib/services/siteSettings";
import { AnalyticsListener } from "@/components/ui/AnalyticsListener";
import { localePath } from "@/lib/localePath";
import "../globals.css";

// Figma "Booky Kitabevi" tipografisi: gövde/arayüz Mulish, başlıklar Young
// Serif, alıntı/alt başlık italikleri Literata Medium Italic.
const mulish = Mulish({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});
const youngSerif = Young_Serif({
  variable: "--font-serif",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  display: "swap",
});
const literata = Literata({
  variable: "--font-accent",
  subsets: ["latin", "latin-ext"],
  weight: "500",
  style: "italic",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const activeLocale: Locale = isLocale(locale) ? locale : "tr";
  const settings = await getSiteSettings();

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.brandName,
      template: `%s | ${siteConfig.brandName}`,
    },
    description: siteConfig.description[activeLocale],
    icons: settings.favicon ? { icon: settings.favicon } : undefined,
    alternates: {
      canonical: localePath(activeLocale, "/"),
      languages: {
        tr: localePath("tr", "/"),
        en: localePath("en", "/"),
      },
    },
    openGraph: {
      title: siteConfig.brandName,
      description: siteConfig.description[activeLocale],
      url: siteConfig.url,
      siteName: siteConfig.brandName,
      locale: activeLocale === "tr" ? "tr_TR" : "en_US",
      type: "website",
      // Kendi generateMetadata'sı olmayan sayfalar (ör. ana sayfa) da admin >
      // Genel Ayarlar'daki varsayılan OG görselini kullansın; diğer sayfalar
      // lib/buildMetadata.ts üzerinden aynı varsayılana düşüyor.
      images: settings.ogImageDefault ? [{ url: settings.ogImageDefault }] : undefined,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      className={`${mulish.variable} ${youngSerif.variable} ${literata.variable}`}
    >
      <body
        style={
          {
            "--brand-primary": siteConfig.colors.primary,
            "--brand-secondary": siteConfig.colors.secondary,
            "--brand-accent": siteConfig.colors.accent,
          } as React.CSSProperties
        }
        className="flex min-h-screen flex-col antialiased"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-20 bg-[url('/images/hero/backgroundnew.jpeg')] bg-cover bg-center bg-no-repeat"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 bg-background/93"
        />

        <AnalyticsListener />
        {children}
      </body>
    </html>
  );
}
