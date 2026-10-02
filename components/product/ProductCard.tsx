"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";
import { localePath } from "@/lib/localePath";
import { authors } from "@/data/authors";
import type { Product } from "@/types";
import type { Locale } from "@/config/i18n.config";
import type { Dictionary } from "@/lib/getDictionary";

export function ProductCard({
  product,
  locale,
  dict,
  view = "grid",
  compact = false,
}: {
  product: Product;
  locale: Locale;
  dict: Dictionary;
  view?: "grid" | "list";
  compact?: boolean;
}) {
  const author = authors.find((a) => a.id === product.authorId);
  const showPrice = product.showPrice !== false;

  const productHref = localePath(locale, `/bookstore/${product.slug}`);

  if (view === "list") {
    return (
      <div className="group flex gap-4 overflow-hidden rounded-lg border border-black/5 bg-white p-3 transition hover:shadow-md">
        <Link
          href={productHref}
          className="relative block aspect-2/3 w-24 shrink-0 overflow-hidden rounded-md bg-brand-accent/20 sm:w-32"
        >
          {product.coverImage && (
            <Image src={product.coverImage} alt={product.title} fill sizes="128px" className="object-cover" />
          )}
        </Link>
        <div className="flex flex-1 flex-col gap-1">
          <Link href={productHref} className="font-serif text-base font-semibold hover:text-brand-primary">
            {product.title}
          </Link>
          {author && (
            <Link
              href={localePath(locale, `/yayinevi/yazarlarimiz/${author.slug}`)}
              className="text-sm text-foreground/60 hover:text-brand-primary"
            >
              {author.name}
            </Link>
          )}
          <p className="mt-1 line-clamp-2 text-base text-foreground/60">{product.description}</p>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-3">
              {showPrice && <span className="font-semibold">{formatPrice(product.price, locale)}</span>}
            </div>
            <Link
              href={productHref}
              className="rounded-md bg-brand-primary px-3 py-1.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {dict.common.viewDetails}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-lg border border-black/5 bg-white transition hover:shadow-md ${compact ? "" : "h-full"}`}
    >
      <Link
        href={productHref}
        className={`relative block w-full overflow-hidden bg-brand-accent/20 ${compact ? "h-36" : "aspect-2/3"}`}
      >
        {product.coverImage && (
          <Image
            src={product.coverImage}
            alt={product.title}
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        )}
      </Link>
      <div className={`flex flex-1 flex-col gap-1 ${compact ? "p-2.5" : "p-3"}`}>
        <Link
          href={productHref}
          className={`line-clamp-2 font-serif font-semibold hover:text-brand-primary ${compact ? "text-sm" : "min-h-12 text-base"}`}
        >
          {product.title}
        </Link>
        {author && (
          <Link
            href={localePath(locale, `/authors/${author.slug}`)}
            className="text-sm text-foreground/60 hover:text-brand-primary"
          >
            {author.name}
          </Link>
        )}
        <div className="mt-1 flex items-center justify-between">
          {showPrice && <span className="font-semibold">{formatPrice(product.price, locale)}</span>}
        </div>
        <Link
          href={productHref}
          className="mt-auto rounded-md bg-brand-primary px-3 py-1.5 text-center text-sm font-semibold text-white transition hover:opacity-90"
        >
          {dict.common.viewDetails}
        </Link>
      </div>
    </div>
  );
}
