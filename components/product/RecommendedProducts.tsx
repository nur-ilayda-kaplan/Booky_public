import { ProductCard } from "@/components/product/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Product } from "@/types";
import type { Locale } from "@/config/i18n.config";
import type { Dictionary } from "@/lib/getDictionary";

export function RecommendedProducts({
  title,
  products,
  locale,
  dict,
  compact = false,
}: {
  title: string;
  products: Product[];
  locale: Locale;
  dict: Dictionary;
  compact?: boolean;
}) {
  if (products.length === 0) return null;

  return (
    <section className="mt-16">
      <SectionHeading title={title} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            locale={locale}
            dict={dict}
            compact={compact}
          />
        ))}
      </div>
    </section>
  );
}
