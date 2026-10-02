import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/config/i18n.config";
import { getDictionary } from "@/lib/getDictionary";
import { formatDate } from "@/lib/formatDate";
import { buildMetadata } from "@/lib/buildMetadata";
import { getPressMentions } from "@/lib/services/press";
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
    path: "/press",
    title: dict.press.title,
    description: dict.press.title,
  });
}

export default async function PressPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);

  const mentions = await getPressMentions();

  return (
    <PageContainer className="py-12">
      <div className="max-w-3xl">
        <h1 className="mb-8 font-serif text-3xl font-semibold">{dict.press.title}</h1>
        {mentions.length === 0 ? (
          <p className="rounded-lg border border-black/5 bg-white p-8 text-center text-base text-foreground/60">
            {dict.common.noResults}
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {mentions.map((mention) => (
              <a
                key={mention.id}
                href={mention.url}
                target="_blank"
                rel="noreferrer"
                className="group rounded-lg border border-black/5 bg-white p-5 transition hover:shadow-md"
              >
                <div className="flex items-center justify-between text-sm text-foreground/50">
                  <span className="font-semibold uppercase tracking-wide text-brand-primary">
                    {mention.source}
                  </span>
                  <span>{formatDate(mention.publishedAt, locale)}</span>
                </div>
                <h2 className="mt-2 font-serif text-lg font-semibold group-hover:text-brand-primary">
                  {mention.title}
                </h2>
                <p className="mt-2 text-base leading-relaxed text-foreground/70">{mention.excerpt}</p>
              </a>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
