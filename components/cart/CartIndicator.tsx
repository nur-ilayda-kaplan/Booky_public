"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { localePath } from "@/lib/localePath";
import type { Locale } from "@/config/i18n.config";

export function CartIndicator({
  locale,
  label,
}: {
  locale: Locale;
  label: string;
}) {
  const { totalItems } = useCart();

  return (
    <Link
      href={localePath(locale, "/cart")}
      aria-label={label}
      className="relative inline-flex items-center gap-2 text-base font-medium hover:text-brand-primary"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <path
          d="M3 4h2l1.6 10.6a2 2 0 0 0 2 1.7h8.2a2 2 0 0 0 2-1.6L20 8H6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9.5" cy="20" r="1.4" />
        <circle cx="17" cy="20" r="1.4" />
      </svg>
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-primary px-1 text-[10px] font-semibold text-white">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
