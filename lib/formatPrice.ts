import type { Locale } from "@/config/i18n.config";

const localeMap: Record<Locale, string> = {
  tr: "tr-TR",
  en: "en-US",
};

export function formatPrice(price: number, locale: Locale = "tr"): string {
  return new Intl.NumberFormat(localeMap[locale], {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(price);
}
