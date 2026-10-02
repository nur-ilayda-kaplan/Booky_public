import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/config/i18n.config";
import { getDictionary } from "@/lib/getDictionary";
import { buildMetadata } from "@/lib/buildMetadata";
import { getBlogPosts, getBlogAuthors } from "@/lib/services/blog";
import { BlogListClient } from "@/components/blog/BlogListClient";
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
    path: "/kitabevi/blog",
    title: dict.blog.title,
    description: dict.home.latestPosts,
  });
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ yazar?: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);
  const { yazar } = await searchParams;

  const [posts, authors] = await Promise.all([
    getBlogPosts(),
    getBlogAuthors(),
  ]);

  return (
    <PageContainer className="py-12">
      <h1 className="mb-8 font-serif text-3xl font-semibold">{dict.blog.title}</h1>
      <BlogListClient
        posts={posts}
        authors={authors}
        locale={locale}
        dict={dict}
        initialAuthor={yazar}
      />
    </PageContainer>
  );
}
