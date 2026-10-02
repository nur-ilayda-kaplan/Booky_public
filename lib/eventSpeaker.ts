import type { EventItem } from "@/types";
import type { Locale } from "@/config/i18n.config";

// Admin'de yalnızca Tarih ve Saat zorunlu; diğer her şey boşsa genel ad.
function genericEventName(locale: Locale): string {
  return locale === "tr" ? "Etkinlik" : "Event";
}

// Kartta ve takvimde gösterilen ad: "Konuşmacı / Sunan" alanı, boşsa seçili
// yazarların adı, o da yoksa etkinlik başlığı (bkz. admin EventForm notları).
export function eventSpeakerName(event: EventItem, locale: Locale): string {
  return event.speaker || event.authorNames?.join(", ") || event.title || genericEventName(locale);
}

// Detay sayfası başlığı: Başlık, boşsa konuşmacı/yazar adı.
export function eventTitle(event: EventItem, locale: Locale): string {
  return event.title || eventSpeakerName(event, locale);
}
