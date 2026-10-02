import type { SalesLink } from "@prisma/client";
import type { Dictionary } from "@/lib/getDictionary";

export function ProductDetailActions({
  salesLinks,
  dict,
}: {
  salesLinks: SalesLink[];
  dict: Dictionary;
}) {
  if (salesLinks.length === 0) {
    return (
      <p className="text-base text-foreground/50">{dict.product.noSalesLinks}</p>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      {salesLinks.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-md bg-brand-primary px-6 py-3 text-center text-base font-semibold text-white transition hover:opacity-90 sm:flex-none"
        >
          {link.label} {link.platform && `(${link.platform})`}
        </a>
      ))}
    </div>
  );
}
