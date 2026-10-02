import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { isLocale, type Locale } from "@/config/i18n.config";
import { siteConfig } from "@/config/site.config";
import { getDictionary } from "@/lib/getDictionary";
import { buildMetadata } from "@/lib/buildMetadata";
import {
  getSiteSettings,
  resolveAboutContent,
} from "@/lib/services/siteSettings";
import { PressBanner } from "@/components/ui/PressBanner";
import { PageContainer } from "@/components/layout/PageContainer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "tr";
  const dict = getDictionary(locale);
  const settings = await getSiteSettings();
  const about = resolveAboutContent(settings, locale);

  return buildMetadata({
    locale,
    path: "/kitabevi/hakkimizda",
    title: dict.about.title,
    description: about.lead,
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);
  const settings = await getSiteSettings();
  const about = resolveAboutContent(settings, locale);

  return (
    <PageContainer className="py-12">
      <div className="max-w-3xl">
        <h1 className="font-serif text-3xl font-semibold sm:text-4xl">
          {dict.about.title}
        </h1>
        <p className="mt-3 text-lg text-brand-primary">{about.lead}</p>

        <div className="prose prose-lg prose-neutral mt-8 max-w-none prose-headings:font-serif">
          <ReactMarkdown>{about.body}</ReactMarkdown>
        </div>

        <p className="mt-10 text-base text-foreground/50">
          {siteConfig.brandName} — {siteConfig.owner}
        </p>
      </div>

      <PressBanner locale={locale} dict={dict} />
    </PageContainer>
  );
}
