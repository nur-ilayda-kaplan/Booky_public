import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { isLocale, type Locale } from "@/config/i18n.config";
import { getDictionary } from "@/lib/getDictionary";
import { localePath } from "@/lib/localePath";
import { formatDate } from "@/lib/formatDate";
import { buildMetadata } from "@/lib/buildMetadata";
import { getBlogPostBySlug, getRelatedBlogPosts } from "@/lib/services/blog";
import { getAuthorById } from "@/lib/services/authors";
import { siteConfig } from "@/config/site.config";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogPostActions } from "@/components/blog/BlogPostActions";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageContainer } from "@/components/layout/PageContainer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "tr";
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return buildMetadata({
      locale,
      path: `/kitabevi/blog/${slug}`,
      title: "Booky",
      description: "",
    });
  }

  return buildMetadata({
    locale,
    path: `/kitabevi/blog/${post.slug}`,
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    ogTitle: post.ogTitle,
    ogDescription: post.ogDescription,
    image: post.ogImage || post.coverImage,
    canonicalUrl: post.canonicalUrl,
    noIndex: post.noIndex,
  });
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);

  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const [author, relatedPosts] = await Promise.all([
    getAuthorById(post.authorId),
    getRelatedBlogPosts(post),
  ]);

  return (
    <PageContainer className="py-12">
      <article className="max-w-3xl">
        <h1 className="font-serif text-3xl font-semibold sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-4 flex items-center gap-3 text-base text-foreground/60">
          {post.authorName ? (
            <span>
              {dict.blog.by}{" "}
              {post.authorSlug ? (
                <Link
                  href={`${localePath(locale, "/kitabevi/blog")}?yazar=${post.authorSlug}`}
                  className="font-medium hover:text-brand-primary hover:underline"
                >
                  {post.authorName}
                </Link>
              ) : (
                post.authorName
              )}
            </span>
          ) : author && (
            <>
              <span className="relative h-8 w-8 overflow-hidden rounded-full bg-brand-accent/30">
                {author.photo && (
                  <Image
                    src={author.photo}
                    alt={author.name}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                )}
              </span>
              <span>
                {dict.blog.by} {author.name}
              </span>
            </>
          )}
          <span>·</span>
          <span>{formatDate(post.publishedAt, locale)}</span>
          <BlogPostActions
            url={`${siteConfig.url}${localePath(locale, `/kitabevi/blog/${post.slug}`)}`}
            imageUrl={`/api/blog/${encodeURIComponent(post.slug)}/story-image?locale=${locale}`}
            fileName={`booky-${post.slug}-hikaye.png`}
            dict={dict}
          />
        </div>

        <div className="relative mt-8 aspect-16/9 overflow-hidden rounded-lg bg-brand-accent/20">
          {post.coverImage && (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(min-width: 768px) 720px, 100vw"
              className="object-cover"
              priority
            />
          )}
        </div>

        <div className="prose prose-lg prose-neutral mt-8 max-w-none prose-headings:font-serif">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {author && (
          <div className="mt-12 flex items-center gap-4 rounded-lg border border-black/5 bg-brand-accent/10 p-5">
            <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-brand-accent/30">
              {author.photo && (
                <Image
                  src={author.photo}
                  alt={author.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              )}
            </span>
            <div>
              <Link
                href={localePath(
                  locale,
                  `/yayinevi/yazarlarimiz/${author.slug}`,
                )}
                className="font-serif text-lg font-semibold hover:text-brand-primary"
              >
                {author.name}
              </Link>
              <p className="mt-1 text-base leading-relaxed text-foreground/60">
                {author.shortBio}
              </p>
            </div>
          </div>
        )}

        {relatedPosts.length > 0 && (
          <section className="mt-16">
            <SectionHeading title={dict.blog.relatedPosts} />
            <div className="grid gap-6 sm:grid-cols-2">
              {relatedPosts.map((relatedPost) => (
                <BlogCard
                  key={relatedPost.id}
                  post={relatedPost}
                  locale={locale}
                />
              ))}
            </div>
          </section>
        )}
      </article>
    </PageContainer>
  );
}
