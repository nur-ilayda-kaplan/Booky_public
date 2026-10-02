import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";
import { localePath } from "@/lib/localePath";
import type { Locale } from "@/config/i18n.config";
import type { Dictionary } from "@/lib/getDictionary";

export function CartSummary({
  total,
  locale,
  dict,
}: {
  total: number;
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <div className="flex h-fit flex-col gap-4 rounded-lg border border-black/5 bg-white p-5">
      <div className="flex items-center justify-between text-base">
        <span className="text-foreground/60">{dict.common.subtotal}</span>
        <span className="font-medium">{formatPrice(total, locale)}</span>
      </div>
      <div className="flex items-center justify-between border-t border-black/5 pt-4 text-base font-semibold">
        <span>{dict.common.total}</span>
        <span>{formatPrice(total, locale)}</span>
      </div>
      <Link
        href={localePath(locale, "/checkout")}
        className="mt-2 rounded-md bg-brand-primary px-4 py-3 text-center text-base font-semibold text-white transition hover:opacity-90"
      >
        {dict.cart.checkout}
      </Link>
    </div>
  );
}
