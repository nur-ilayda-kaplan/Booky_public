"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";
import { localePath } from "@/lib/localePath";
import { useCart } from "@/hooks/useCart";
import { QuantityPicker } from "@/components/product/QuantityPicker";
import type { Product } from "@/types";
import type { Locale } from "@/config/i18n.config";
import type { Dictionary } from "@/lib/getDictionary";

export function CartItemRow({
  product,
  quantity,
  locale,
  dict,
}: {
  product: Product;
  quantity: number;
  locale: Locale;
  dict: Dictionary;
}) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-4 border-b border-black/5 py-4">
      <Link
        href={localePath(locale, `/bookstore/${product.slug}`)}
        className="relative block aspect-2/3 w-16 shrink-0 overflow-hidden rounded-md bg-brand-accent/20 sm:w-20"
      >
        {product.coverImage && (
          <Image src={product.coverImage} alt={product.title} fill sizes="80px" className="object-cover" />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1">
        <Link
          href={localePath(locale, `/bookstore/${product.slug}`)}
          className="font-serif text-base font-semibold hover:text-brand-primary"
        >
          {product.title}
        </Link>
        <span className="text-base text-foreground/60">{formatPrice(product.price, locale)}</span>
        <div className="mt-auto flex items-center justify-between gap-4 pt-2">
          <QuantityPicker
            value={quantity}
            onChange={(value) => updateQuantity(product.id, value)}
            max={Math.max(product.stock ?? 99, 1)}
          />
          <button
            type="button"
            onClick={() => removeItem(product.id)}
            className="text-sm font-medium text-red-600 hover:underline"
          >
            {dict.cart.remove}
          </button>
        </div>
      </div>
      <div className="text-right font-semibold">{formatPrice(product.price * quantity, locale)}</div>
    </div>
  );
}
