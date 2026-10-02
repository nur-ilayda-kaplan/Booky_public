import { prisma } from "@/lib/prisma";
import { getProducts } from "@/lib/services/products";
import type { Product } from "@/types";

const DEFAULT_LIMIT = 4;

export async function getFrequentlyBoughtTogether(
  productId: string,
  limit: number = DEFAULT_LIMIT,
): Promise<Product[]> {
  const products = await getProducts();
  const source = products.find((product) => product.id === productId);

  const coOccurringIds = await getCoOccurringProductIds(productId, limit);
  const ranked = coOccurringIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));

  if (ranked.length >= limit) {
    return ranked.slice(0, limit);
  }

  // Not enough order-history data yet (or none) — top up with a category-based fallback.
  const excludeIds = new Set([productId, ...ranked.map((product) => product.id)]);
  const fallback = getFallbackProducts(products, source, excludeIds);

  return [...ranked, ...fallback].slice(0, limit);
}

async function getCoOccurringProductIds(productId: string, limit: number): Promise<string[]> {
  try {
    const coPurchases = await prisma.orderItem.findMany({
      where: { productId },
      select: { orderId: true },
    });
    const orderIds = coPurchases.map((item) => item.orderId);
    if (orderIds.length === 0) return [];

    const grouped = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        orderId: { in: orderIds },
        productId: { not: productId },
      },
      _count: { productId: true },
      orderBy: { _count: { productId: "desc" } },
      take: limit,
    });

    return grouped.map((group) => group.productId);
  } catch {
    // DB unreachable or query failed — recommendations fall back to category-based picks.
    return [];
  }
}

function getFallbackProducts(
  products: Product[],
  source: Product | undefined,
  excludeIds: Set<string>,
): Product[] {
  const candidates = products.filter((product) => !excludeIds.has(product.id));
  const sameCategory = source
    ? candidates.filter((product) => product.categoryId === source.categoryId)
    : [];
  const sameCategoryIds = new Set(sameCategory.map((product) => product.id));
  const otherCategory = candidates.filter((product) => !sameCategoryIds.has(product.id));

  // Same category first (closest match), then top up from the rest of the
  // catalog if that category alone isn't large enough to fill the limit.
  // Within each group, featured ("popular") titles are surfaced before a
  // random shuffle of the remainder.
  return [...rankByFeatured(sameCategory), ...rankByFeatured(otherCategory)];
}

function rankByFeatured(pool: Product[]): Product[] {
  const featured = pool.filter((product) => product.featured);
  const rest = shuffle(pool.filter((product) => !product.featured));
  return [...featured, ...rest];
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
