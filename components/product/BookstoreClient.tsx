"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { ProductFilters } from "./ProductFilters";
import { ProductSearch } from "./ProductSearch";
import { useProductFilter, type ProductFilterState } from "@/hooks/useFilter";
import type { Product, Category, Author } from "@/types";
import type { Locale } from "@/config/i18n.config";
import type { Dictionary } from "@/lib/getDictionary";

const PAGE_SIZE = 8;

export function BookstoreClient({
  products,
  categories,
  authors,
  locale,
  dict,
  initialCategory,
}: {
  products: Product[];
  categories: Category[];
  authors: Author[];
  locale: Locale;
  dict: Dictionary;
  initialCategory?: string;
}) {
  const bounds = useMemo(() => {
    const prices = products.map((product) => product.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  const initialFilters: ProductFilterState = {
    category: initialCategory || "all",
    author: "all",
    minPrice: bounds.min,
    maxPrice: bounds.max,
  };

  const { filters, updateFilter, resetFilters } =
    useProductFilter(initialFilters);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      if (filters.category !== "all" && product.categoryId !== filters.category)
        return false;
      if (filters.author !== "all" && product.authorId !== filters.author)
        return false;
      if (product.price < filters.minPrice || product.price > filters.maxPrice)
        return false;

      if (query) {
        const author = authors.find((a) => a.id === product.authorId);
        const haystack = `${product.title} ${author?.name ?? ""}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }, [products, filters, searchQuery, authors]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  function handleFilterChange<K extends keyof ProductFilterState>(
    key: K,
    value: ProductFilterState[K],
  ) {
    updateFilter(key, value);
    setVisibleCount(PAGE_SIZE);
  }

  function handleSearchChange(query: string) {
    setSearchQuery(query);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <ProductFilters
        categories={categories}
        authors={authors}
        filters={filters}
        onChange={handleFilterChange}
        onReset={() => {
          resetFilters();
          setVisibleCount(PAGE_SIZE);
        }}
        bounds={bounds}
        dict={dict}
        locale={locale}
      />

      <div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="sm:max-w-xs sm:flex-1">
            <ProductSearch
              placeholder={dict.common.searchPlaceholder}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-label={dict.common.gridView}
              className={`flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-brand-primary/10 ${
                view === "grid"
                  ? "bg-brand-primary text-white hover:bg-brand-primary"
                  : "bg-black/5"
              }`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              aria-label={dict.common.listView}
              className={`flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-brand-primary/10 ${
                view === "list"
                  ? "bg-brand-primary text-white hover:bg-brand-primary"
                  : "bg-black/5"
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {visibleProducts.length === 0 ? (
          <p className="rounded-lg border border-black/5 bg-white p-8 text-center text-base leading-relaxed text-foreground/60">
            {dict.common.noResults}
          </p>
        ) : (
          <div
            className={
              view === "grid"
                ? "grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4"
                : "flex flex-col gap-4"
            }
          >
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                locale={locale}
                dict={dict}
                view={view}
              />
            ))}
          </div>
        )}

        {visibleCount < filteredProducts.length && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              className="rounded-full border border-brand-primary px-6 py-2 text-base font-semibold text-brand-primary transition hover:bg-brand-primary hover:text-white"
            >
              {dict.common.loadMore}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
