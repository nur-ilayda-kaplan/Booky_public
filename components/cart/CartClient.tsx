"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { products } from "@/data/products";
import { CartItemRow } from "./CartItemRow";
import { CartSummary } from "./CartSummary";
import { CartRecommendations } from "./CartRecommendations";
import { localePath } from "@/lib/localePath";
import type { Locale } from "@/config/i18n.config";
import type { Dictionary } from "@/lib/getDictionary";

export function CartClient({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { items, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-black/5 bg-white p-12 text-center">
        <p className="text-foreground/60">{dict.cart.empty}</p>
        <Link
          href={localePath(locale, "/bookstore")}
          className="mt-4 inline-block rounded-md bg-brand-primary px-5 py-2.5 text-base font-semibold text-white hover:opacity-90"
        >
          {dict.cart.continueShopping}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          {items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            if (!product) return null;
            return (
              <CartItemRow
                key={item.productId}
                product={product}
                quantity={item.quantity}
                locale={locale}
                dict={dict}
              />
            );
          })}
        </div>
        <CartSummary total={totalPrice} locale={locale} dict={dict} />
      </div>

      <CartRecommendations locale={locale} dict={dict} />
    </div>
  );
}
