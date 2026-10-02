"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { RecommendedProducts } from "@/components/product/RecommendedProducts";
import type { Product } from "@/types";
import type { Locale } from "@/config/i18n.config";
import type { Dictionary } from "@/lib/getDictionary";

export function CartRecommendations({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { items } = useCart();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const firstProductId = items[0]?.productId;

  useEffect(() => {
    if (!firstProductId) {
      setRecommendations([]);
      return;
    }

    const controller = new AbortController();
    fetch(`/api/recommendations?productId=${encodeURIComponent(firstProductId)}&limit=4`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data: Product[]) => setRecommendations(data))
      .catch((error) => {
        if (error.name !== "AbortError") setRecommendations([]);
      });

    return () => controller.abort();
  }, [firstProductId]);

  // Don't suggest something the shopper already has in their cart.
  const cartProductIds = new Set(items.map((item) => item.productId));
  const filteredRecommendations = recommendations.filter(
    (product) => !cartProductIds.has(product.id),
  );

  return (
    <RecommendedProducts
      title={dict.cart.recommendationsTitle}
      products={filteredRecommendations}
      locale={locale}
      dict={dict}
      compact
    />
  );
}
