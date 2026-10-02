import type { Locale } from "@/config/i18n.config";
import tr from "@/locales/tr.json";
import en from "@/locales/en.json";

const dictionaries = { tr, en };

export type Dictionary = typeof tr;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
