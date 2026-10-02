import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/formatDate";
import { localePath } from "@/lib/localePath";
import { authors } from "@/data/authors";
import type { BlogPost } from "@/types";
import type { Locale } from "@/config/i18n.config";

export function BlogCard({ post, locale }: { post: BlogPost; locale: Locale }) {
  const author = authors.find((a) => a.id === post.authorId);

  return (
    <Link
      href={localePath(locale, `/kitabevi/blog/${post.slug}`)}
      className="group flex flex-col overflow-hidden rounded-lg border border-black/5 bg-white transition hover:shadow-md"
    >
      <div className="relative aspect-16/10 overflow-hidden bg-brand-accent/20">
        {post.coverImage && (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 30vw, 90vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-serif text-lg font-semibold group-hover:text-brand-primary">
          {post.title}
        </h3>
        <p className="line-clamp-2 text-base text-foreground/60">{post.excerpt}</p>
        <div className="mt-auto flex items-center justify-between pt-2 text-sm text-foreground/50">
          {post.authorName ? (
            <span>{post.authorName}</span>
          ) : (
            author && (
              <span className="flex items-center gap-2">
                <span className="relative h-6 w-6 overflow-hidden rounded-full bg-brand-accent/30">
                  <Image src={author.photo} alt={author.name} fill sizes="24px" className="object-cover" />
                </span>
                {author.name}
              </span>
            )
          )}
          <span>{formatDate(post.publishedAt, locale)}</span>
        </div>
      </div>
    </Link>
  );
}
