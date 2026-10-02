import type { Locale } from "@/config/i18n.config";

const localeMap: Record<Locale, string> = {
  tr: "tr-TR",
  en: "en-US",
};

export function formatDate(dateString: string, locale: Locale = "tr"): string {
  return new Intl.DateTimeFormat(localeMap[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Istanbul",
  }).format(new Date(dateString));
}

// İstanbul saati — sunucu UTC'de çalıştığı için timeZone verilmezse saat
// 3 saat geri görünür.
export function formatDateTime(dateString: string, locale: Locale = "tr"): string {
  return new Intl.DateTimeFormat(localeMap[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  }).format(new Date(dateString));
}

// Takvim gün gruplaması için "YYYY-MM-DD" anahtar — İstanbul saat dilimini
// baz alır, tarayıcının/sunucunun kendi saat dilimine göre kaymaz (ör. UTC
// sunucuda gece yarısına yakın bir etkinlik yanlış güne düşmesin diye).
// en-CA locale'i ISO (YYYY-MM-DD) formatında tarih döndürdüğü için seçildi.
export function istanbulDateKey(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
}

function capitalize(value: string, locale: Locale): string {
  return value.charAt(0).toLocaleUpperCase(localeMap[locale]) + value.slice(1);
}

// İstanbul saatine göre ayın adı, baş harfi büyük ("Ekim" / "October") —
// ana sayfadaki "{ay} seçkisi", "{ay} Programı" gibi dinamik başlıklar için.
export function istanbulMonthName(locale: Locale, date: Date = new Date()): string {
  const name = new Intl.DateTimeFormat(localeMap[locale], {
    month: "long",
    timeZone: "Europe/Istanbul",
  }).format(date);
  return capitalize(name, locale);
}

// Türkçe ay adlarının ilgi hâli ("Ekim’in", "Temmuz’un") — ünlü uyumu ay
// adına göre değiştiği için sabit tablo.
const TR_MONTH_GENITIVE = [
  "Ocak’ın", "Şubat’ın", "Mart’ın", "Nisan’ın", "Mayıs’ın", "Haziran’ın",
  "Temmuz’un", "Ağustos’un", "Eylül’ün", "Ekim’in", "Kasım’ın", "Aralık’ın",
];

export function istanbulMonthGenitive(locale: Locale, date: Date = new Date()): string {
  if (locale !== "tr") return istanbulMonthName(locale, date);
  const month = Number(istanbulDateKey(date).split("-")[1]);
  return TR_MONTH_GENITIVE[month - 1];
}

// Etkinlik saati: Türkçede "12.00", İngilizcede "12:00" (İstanbul saati).
export function formatEventTime(dateString: string, locale: Locale = "tr"): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Europe/Istanbul",
  }).formatToParts(new Date(dateString));
  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  return `${hour}${locale === "tr" ? "." : ":"}${minute}`;
}

// Ana sayfa etkinlik kartındaki tarih satırı: "6 Ekim, Salı 12.00" (kart
// bunu büyük harfe çevirir). Saat girilmemiş etkinlikte saat kısmı yok.
export function formatEventCardDate(
  dateString: string,
  locale: Locale = "tr",
  hasTime = true,
): string {
  const date = new Date(dateString);
  const dayMonth = new Intl.DateTimeFormat(localeMap[locale], {
    day: "numeric",
    month: "long",
    timeZone: "Europe/Istanbul",
  }).format(date);
  const weekday = new Intl.DateTimeFormat(localeMap[locale], {
    weekday: "long",
    timeZone: "Europe/Istanbul",
  }).format(date);
  const day = `${dayMonth}, ${weekday}`;
  return hasTime ? `${day} ${formatEventTime(dateString, locale)}` : day;
}

// Etkinliğin bittiği kabul edilen an: saatsiz etkinlik İstanbul'da o günün
// sonuna kadar "yaklaşan" listesinde kalır.
export function eventEndTime(event: { date: string; hasTime?: boolean }): number {
  const start = new Date(event.date).getTime();
  return event.hasTime === false ? start + 86_400_000 : start;
}

// <input type="date"> için "YYYY-MM-DD" — ör. PressMention.publishedAt gibi
// saat bilgisi taşımayan alanlarda toDateTimeInputValue yerine kullanılır.
export function toDateInputValue(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

// Verilen anın İstanbul'daki duvar saati bileşenleri — tarayıcının/sunucunun
// kendi saat diliminden bağımsız.
function istanbulParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Istanbul",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

// <input type="datetime-local"> değeri timezone bilgisi taşımaz; admin
// panelinde girilen saat her zaman İstanbul saatidir. Değer İstanbul saatine
// göre gösterilir — toISOString() UTC'ye çevirip saati kaydırırdı.
export function toDateTimeInputValue(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  const p = istanbulParts(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

// datetime-local'den gelen "YYYY-MM-DDTHH:mm" değerini İstanbul saati olarak
// yorumlar. Sunucuda new Date(value) kullanılamaz: sunucu UTC'de çalıştığı
// için 12.00 girilen etkinlik UTC 12.00 (İstanbul 15.00) olarak kaydedilir.
export function parseIstanbulDateTime(value: string): Date {
  if (/(Z|[+-]\d{2}:?\d{2})$/i.test(value)) return new Date(value);
  const asUtc = new Date(`${value}Z`);
  if (Number.isNaN(asUtc.getTime())) return asUtc;
  const p = istanbulParts(asUtc);
  const offset = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - asUtc.getTime();
  return new Date(asUtc.getTime() - offset);
}
