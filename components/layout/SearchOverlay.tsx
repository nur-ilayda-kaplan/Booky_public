"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { localePath } from "@/lib/localePath";
import type { Locale } from "@/config/i18n.config";
import type { Dictionary } from "@/lib/getDictionary";
import type { SearchResults } from "@/lib/services/search";

const EMPTY_RESULTS: SearchResults = { products: [], blogPosts: [], authors: [] };

function useSearchQuery() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults(EMPTY_RESULTS);
      setLoading(false);
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data: SearchResults) => {
          setResults(data);
          setLoading(false);
        })
        .catch((error) => {
          if (error.name !== "AbortError") setLoading(false);
        });
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const hasResults =
    results.products.length > 0 || results.blogPosts.length > 0 || results.authors.length > 0;

  return { query, setQuery, results, loading, hasResults };
}

function SearchResultGroup({
  title,
  items,
  hrefBase,
  locale,
  onNavigate,
}: {
  title: string;
  items: SearchResults["products"];
  hrefBase: string;
  locale: Locale;
  onNavigate: () => void;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <p className="px-3 pt-2 text-sm font-semibold uppercase tracking-wide text-foreground/50">
        {title}
      </p>
      <div className="flex flex-col">
        {items.map((item) => (
          <Link
            key={item.id}
            href={localePath(locale, `${hrefBase}/${item.slug}`)}
            onClick={onNavigate}
            className="rounded px-3 py-2 text-base font-medium hover:bg-brand-accent/40"
          >
            {item.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

function SearchResultsPanel({
  results,
  loading,
  query,
  dict,
  locale,
  onNavigate,
}: {
  results: SearchResults;
  loading: boolean;
  query: string;
  dict: Dictionary;
  locale: Locale;
  onNavigate: () => void;
}) {
  const hasResults =
    results.products.length > 0 || results.blogPosts.length > 0 || results.authors.length > 0;

  if (!query.trim()) return null;

  if (loading) {
    return <p className="px-3 py-4 text-center text-base leading-relaxed text-foreground/60">{dict.common.loading}</p>;
  }

  if (!hasResults) {
    return <p className="px-3 py-4 text-center text-base leading-relaxed text-foreground/60">{dict.common.noResults}</p>;
  }

  return (
    <div className="flex flex-col gap-2 py-2">
      <SearchResultGroup
        title={dict.nav.bookstore}
        items={results.products}
        hrefBase="/bookstore"
        locale={locale}
        onNavigate={onNavigate}
      />
      <SearchResultGroup
        title={dict.blog.title}
        items={results.blogPosts}
        hrefBase="/kitabevi/blog"
        locale={locale}
        onNavigate={onNavigate}
      />
      <SearchResultGroup
        title={dict.authors.title}
        items={results.authors}
        hrefBase="/yayinevi/yazarlarimiz"
        locale={locale}
        onNavigate={onNavigate}
      />
    </div>
  );
}

export function SearchOverlay({
  locale,
  dict,
  variant = "icon",
  onResultNavigate,
}: {
  locale: Locale;
  dict: Dictionary;
  variant?: "icon" | "row";
  onResultNavigate?: () => void;
}) {
  const { query, setQuery, results, loading } = useSearchQuery();

  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || variant !== "icon") return;

    const button = buttonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      setPosition({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }

    function handleClick(event: MouseEvent) {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    function handleDismiss() {
      setOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    window.addEventListener("scroll", handleDismiss, true);
    window.addEventListener("resize", handleDismiss);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", handleDismiss, true);
      window.removeEventListener("resize", handleDismiss);
    };
  }, [open, variant]);

  function closeAndReset() {
    setOpen(false);
    setQuery("");
  }

  if (variant === "row") {
    return (
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={dict.common.searchPlaceholder}
            className="w-full rounded-md border border-black/10 py-2.5 pl-9 pr-3 text-base focus:border-brand-primary focus:outline-none"
          />
        </div>
        <SearchResultsPanel
          results={results}
          loading={loading}
          query={query}
          dict={dict}
          locale={locale}
          onNavigate={() => {
            setQuery("");
            onResultNavigate?.();
          }}
        />
      </div>
    );
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={dict.common.search}
        aria-expanded={open}
        className="flex shrink-0 transition-opacity hover:opacity-70"
      >
        {/* Figma "ikon, ara" (2:100), 22×22 */}
        <Image src="/images/icons/icon-search.svg" alt="" width={22} height={22} />
      </button>

      {open &&
        position &&
        createPortal(
          <div
            ref={panelRef}
            className="animate-dropdown fixed z-50 flex w-80 flex-col rounded-md border border-black/5 bg-background p-2 shadow-lg sm:w-96"
            style={{ top: position.top, right: position.right }}
          >
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40"
              />
              <input
                autoFocus
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={dict.common.searchPlaceholder}
                className="w-full rounded-md border border-black/10 py-2.5 pl-9 pr-9 text-base focus:border-brand-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={closeAndReset}
                aria-label={dict.common.close}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>
            <SearchResultsPanel
              results={results}
              loading={loading}
              query={query}
              dict={dict}
              locale={locale}
              onNavigate={closeAndReset}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
