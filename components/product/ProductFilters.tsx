"use client";

import type { Category, Author } from "@/types";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/config/i18n.config";
import type { ProductFilterState } from "@/hooks/useFilter";

export function ProductFilters({
  categories,
  authors,
  filters,
  onChange,
  onReset,
  bounds,
  dict,
  locale,
}: {
  categories: Category[];
  authors: Author[];
  filters: ProductFilterState;
  onChange: <K extends keyof ProductFilterState>(key: K, value: ProductFilterState[K]) => void;
  onReset: () => void;
  bounds: { min: number; max: number };
  dict: Dictionary;
  locale: Locale;
}) {
  return (
    <div className="flex flex-col gap-6 rounded-lg border border-black/5 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold uppercase tracking-wide text-foreground/60">
          {dict.common.filters}
        </span>
        <button
          type="button"
          onClick={onReset}
          className="text-sm font-medium text-brand-primary hover:underline"
        >
          {dict.common.clearFilters}
        </button>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-foreground/60">
          {dict.common.category}
        </label>
        <select
          value={filters.category}
          onChange={(event) => onChange("category", event.target.value)}
          className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-base"
        >
          <option value="all">{dict.common.all}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name[locale]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-foreground/60">
          {dict.common.author}
        </label>
        <select
          value={filters.author}
          onChange={(event) => onChange("author", event.target.value)}
          className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-base"
        >
          <option value="all">{dict.common.all}</option>
          {authors.map((author) => (
            <option key={author.id} value={author.id}>
              {author.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-foreground/60">
          {dict.common.priceRange}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={bounds.min}
            max={filters.maxPrice}
            value={filters.minPrice}
            onChange={(event) => onChange("minPrice", Number(event.target.value))}
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-base"
            aria-label="Min"
          />
          <span className="text-foreground/40">–</span>
          <input
            type="number"
            min={filters.minPrice}
            max={bounds.max}
            value={filters.maxPrice}
            onChange={(event) => onChange("maxPrice", Number(event.target.value))}
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-base"
            aria-label="Max"
          />
        </div>
      </div>
    </div>
  );
}
