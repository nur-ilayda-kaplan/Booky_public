import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/config/i18n.config";
import { getDictionary } from "@/lib/getDictionary";
import { buildMetadata } from "@/lib/buildMetadata";
import { getAuthors } from "@/lib/services/authors";
import { AuthorCard } from "@/components/author/AuthorCard";
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
    path: "/yayinevi/yazarlarimiz",
    title: dict.authors.title,
    description: dict.authors.introLead,
  });
}

export default async function AuthorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);

  const authorsList = await getAuthors();

  return (
    <PageContainer className="py-12">
      <h1 className="font-serif text-3xl font-semibold sm:text-4xl">
        {dict.authors.title}
      </h1>
      <p className="mt-3 text-lg text-brand-primary">
        {dict.authors.introLead}
      </p>
      <div className="mt-8 flex max-w-3xl flex-col gap-5 leading-relaxed text-foreground/80">
        {dict.authors.introParagraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {authorsList.map((author) => (
          <AuthorCard
            key={author.id}
            author={author}
            locale={locale}
            dict={dict}
          />
        ))}
      </div>
    </PageContainer>
  );
}
