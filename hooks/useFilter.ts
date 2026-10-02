"use client";

import { useState } from "react";

export interface ProductFilterState {
  category: string;
  author: string;
  minPrice: number;
  maxPrice: number;
}

export function useProductFilter(initial: ProductFilterState) {
  const [filters, setFilters] = useState<ProductFilterState>(initial);

  function updateFilter<K extends keyof ProductFilterState>(key: K, value: ProductFilterState[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function resetFilters() {
    setFilters(initial);
  }

  return { filters, updateFilter, resetFilters };
}
