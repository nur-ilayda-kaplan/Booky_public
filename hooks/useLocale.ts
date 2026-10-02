"use client";

import { useParams } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/config/i18n.config";

export function useLocale(): Locale {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale;
  return locale && isLocale(locale) ? locale : defaultLocale;
}
