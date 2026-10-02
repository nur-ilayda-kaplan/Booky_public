import Image from "next/image";
import Link from "next/link";
import { localePath } from "@/lib/localePath";
import { products } from "@/data/products";
import type { Author } from "@/types";
import type { Locale } from "@/config/i18n.config";
import type { Dictionary } from "@/lib/getDictionary";

export function AuthorCard({
  author,
  locale,
  dict,
}: {
  author: Author;
  locale: Locale;
  dict: Dictionary;
}) {
  const bookCount = products.filter(
    (product) => product.authorId === author.id,
  ).length;

  return (
    <Link
      href={localePath(locale, `/yayinevi/yazarlarimiz/${author.slug}`)}
      className="group flex snap-start flex-col items-center rounded-lg border border-black/5 bg-white p-5 text-center transition hover:shadow-md"
    >
      <div className="relative h-24 w-24 overflow-hidden rounded-full bg-brand-accent/20">
        {author.photo && (
          <Image
            src={author.photo}
            alt={author.name}
            fill
            sizes="96px"
            className="object-cover"
          />
        )}
      </div>
      <h3 className="mt-3 font-serif text-base font-semibold group-hover:text-brand-primary">
        {author.name}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-foreground/60">
        {author.shortBio}
      </p>
      {/* <span className="mt-2 text-sm font-medium text-brand-primary">
        {bookCount} {dict.authors.books}
      </span> */}
    </Link>
  );
}
