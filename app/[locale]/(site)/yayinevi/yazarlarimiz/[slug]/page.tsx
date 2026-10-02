import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/config/i18n.config";
import { getDictionary } from "@/lib/getDictionary";
import { buildMetadata } from "@/lib/buildMetadata";
import { getAuthorBySlug } from "@/lib/services/authors";
import { getProductsByAuthor } from "@/lib/services/products";
import { getBlogPostsByAuthor } from "@/lib/services/blog";
import { ProductCard } from "@/components/product/ProductCard";
import { BlogCard } from "@/components/blog/BlogCard";
import { SpotifyEmbed } from "@/components/author/SpotifyEmbed";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { InstagramIcon } from "@/components/ui/icons/InstagramIcon";
import { TwitterIcon } from "@/components/ui/icons/TwitterIcon";
import { WebsiteIcon } from "@/components/ui/icons/WebsiteIcon";
import { PageContainer } from "@/components/layout/PageContainer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "tr";
  const author = await getAuthorBySlug(slug);

  if (!author) {
    return buildMetadata({ locale, path: `/yayinevi/yazarlarimiz/${slug}`, title: "Booky", description: "" });
  }

  return buildMetadata({
    locale,
    path: `/yayinevi/yazarlarimiz/${author.slug}`,
    title: author.name,
    description: author.shortBio,
    image: author.photo,
  });
}

export default async function AuthorDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);

  const author = await getAuthorBySlug(slug);
  if (!author) notFound();

  const [books, posts] = await Promise.all([
    getProductsByAuthor(author.id),
    getBlogPostsByAuthor(author.id),
  ]);

  return (
    <PageContainer className="py-12">
      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
        <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full bg-brand-accent/20">
          {author.photo && (
            <Image src={author.photo} alt={author.name} fill sizes="128px" className="object-cover" />
          )}
        </div>
        <div>
          <h1 className="font-serif text-3xl font-semibold">{author.name}</h1>
          <p className="mt-2 leading-relaxed text-foreground/70">{author.shortBio}</p>
          <div className="mt-3 flex items-center justify-center gap-3 sm:justify-start">
            {author.socials.instagram && (
              <a href={author.socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
                <InstagramIcon size={20} />
              </a>
            )}
            {author.socials.twitter && (
              <a
                href={author.socials.twitter}
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className="text-foreground/70 hover:text-brand-primary"
              >
                <TwitterIcon size={20} />
              </a>
            )}
            {author.socials.website && (
              <a href={author.socials.website} target="_blank" rel="noreferrer" aria-label="Website">
                <WebsiteIcon size={20} />
              </a>
            )}
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-serif text-xl font-semibold">{dict.authors.biography}</h2>
        <p className="mt-3 leading-relaxed text-foreground/80">{author.bio}</p>
      </section>

      {author.spotifyPlaylistUrl && (
        <section className="mt-10">
          <h2 className="mb-3 font-serif text-xl font-semibold">{dict.authors.listen}</h2>
          <SpotifyEmbed url={author.spotifyPlaylistUrl} />
        </section>
      )}

      {books.length > 0 && (
        <section className="mt-14">
          <SectionHeading title={dict.authors.theirBooks} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {books.map((book) => (
              <ProductCard key={book.id} product={book} locale={locale} dict={dict} />
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section className="mt-14">
          <SectionHeading title={dict.authors.theirPosts} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </PageContainer>
  );
}
