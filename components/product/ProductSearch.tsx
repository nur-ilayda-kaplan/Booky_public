"use client";

import { useEffect } from "react";
import { useSearch } from "@/hooks/useSearch";

export function ProductSearch({
  placeholder,
  onChange,
}: {
  placeholder: string;
  onChange: (query: string) => void;
}) {
  const { query, setQuery, debouncedQuery } = useSearch("", 300);

  useEffect(() => {
    onChange(debouncedQuery);
  }, [debouncedQuery, onChange]);

  return (
    <input
      type="search"
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md border border-black/10 bg-white px-4 py-2 text-base focus:border-brand-primary focus:outline-none"
    />
  );
}
