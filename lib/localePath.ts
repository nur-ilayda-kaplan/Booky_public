import { defaultLocale, type Locale } from "@/config/i18n.config";

// Varsayılan dil (tr) URL'lerde önek taşımaz — "as-needed" önek stratejisi.
// bookykitabevi.com/blog Türkçe içeriği gösterir, İngilizce için ise
// /en/blog gibi her zaman açık bir önek gerekir.
export function localePath(locale: Locale, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const suffix = normalized === "/" ? "" : normalized;
  return locale === defaultLocale ? suffix || "/" : `/${locale}${suffix}`;
}
