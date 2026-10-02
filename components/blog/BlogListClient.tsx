"use client";

import { useMemo, useState } from "react";
import { BlogCard } from "./BlogCard";
import type { BlogPost } from "@/types";
import type { BlogAuthorOption } from "@/lib/blogAuthor";
import type { Locale } from "@/config/i18n.config";
import type { Dictionary } from "@/lib/getDictionary";

export function BlogListClient({
  posts,
  authors,
  locale,
  dict,
  initialAuthor,
}: {
  posts: BlogPost[];
  authors: BlogAuthorOption[];
  locale: Locale;
  dict: Dictionary;
  initialAuthor?: string;
}) {
  const [activeAuthor, setActiveAuthor] = useState(
    authors.some((author) => author.slug === initialAuthor) ? initialAuthor! : "all",
  );

  const filteredPosts = useMemo(
    () =>
      activeAuthor === "all" ? posts : posts.filter((post) => post.authorSlug === activeAuthor),
    [posts, activeAuthor],
  );

  return (
    <div>
      {authors.length > 0 && (
        <label className="mb-8 flex max-w-xs flex-col gap-1 text-base">
          <span className="text-sm font-medium text-foreground/60">{dict.blog.authorFilter}</span>
          <select
            value={activeAuthor}
            onChange={(event) => setActiveAuthor(event.target.value)}
            className="rounded-md border border-black/10 bg-white px-3 py-2 text-base focus:border-brand-primary focus:outline-none"
          >
            <option value="all">{dict.blog.allAuthors}</option>
            {authors.map((author) => (
              <option key={author.slug} value={author.slug}>
                {author.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {filteredPosts.length === 0 ? (
        <p className="rounded-lg border border-black/5 bg-white p-8 text-center text-base leading-relaxed text-foreground/60">
          {dict.common.noResults}
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <BlogCard key={post.id} post={post} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
