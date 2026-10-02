"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { eventSpeakerName } from "@/lib/eventSpeaker";
import { formatEventTime, istanbulDateKey } from "@/lib/formatDate";
import { localePath } from "@/lib/localePath";
import type { EventItem } from "@/types";
import type { Locale } from "@/config/i18n.config";
import type { Dictionary } from "@/lib/getDictionary";

// Pazartesi kolonu 0 olacak şekilde sabit bir Pazartesi (2023-01-02) —
// sadece Intl'den locale'e uygun kısa gün adlarını okumak için, kendisi
// hiç render edilmez.
const REFERENCE_MONDAY_UTC = Date.UTC(2023, 0, 2);

function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  // getUTCDay(): 0=Pazar..6=Cumartesi — Pazartesi 0. kolon olacak şekilde kaydır.
  const firstWeekday = (firstDay.getUTCDay() + 6) % 7;

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(Date.UTC(year, month, day)));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

// Server component (Prisma'dan events çeker) → prop olarak buraya geçer;
// bileşenin kendisi veri çekmez, tek yönlü veri akışı.
export function EventsCalendar({
  events,
  locale,
  dict,
}: {
  events: EventItem[];
  locale: Locale;
  dict: Dictionary;
}) {
  const c = dict.events.calendar;
  const intlLocale = locale === "tr" ? "tr-TR" : "en-US";

  const todayKey = istanbulDateKey(new Date());
  const [todayYear, todayMonthNumber] = todayKey.split("-").map(Number);
  const currentMonthIndex = todayMonthNumber - 1;

  const [displayed, setDisplayed] = useState({ year: todayYear, month: currentMonthIndex });

  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(intlLocale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, i) =>
      formatter.format(new Date(REFERENCE_MONDAY_UTC + i * 86_400_000)),
    );
  }, [intlLocale]);

  const monthLabel = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(intlLocale, {
      month: "long",
      year: "numeric",
      timeZone: "Europe/Istanbul",
    });
    const label = formatter.format(new Date(Date.UTC(displayed.year, displayed.month, 1)));
    return label.charAt(0).toLocaleUpperCase(intlLocale) + label.slice(1);
  }, [intlLocale, displayed]);

  // Tarih anahtarı İstanbul saat dilimine göre üretilir (bkz.
  // lib/formatDate.ts istanbulDateKey) — sunucunun/tarayıcının kendi saat
  // dilimi ne olursa olsun bir etkinlik hep aynı güne düşer.
  const eventsByDay = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    for (const event of events) {
      const key = istanbulDateKey(new Date(event.date));
      const existing = map.get(key);
      if (existing) {
        existing.push(event);
      } else {
        map.set(key, [event]);
      }
    }
    return map;
  }, [events]);

  const grid = useMemo(() => buildMonthGrid(displayed.year, displayed.month), [displayed]);

  function goToPreviousMonth() {
    setDisplayed((current) => {
      const month = current.month === 0 ? 11 : current.month - 1;
      const year = current.month === 0 ? current.year - 1 : current.year;
      return { year, month };
    });
  }

  function goToNextMonth() {
    setDisplayed((current) => {
      const month = current.month === 11 ? 0 : current.month + 1;
      const year = current.month === 11 ? current.year + 1 : current.year;
      return { year, month };
    });
  }

  // Figma "takvim, Ekim 2026" (2:164) iç düzeni: ay seçici, 20px aralık,
  // 7 sütunlu gün ızgarası (10px aralık, 96px yükseklikte hücreler).
  const navButtonClasses =
    "whitespace-pre rounded-full border border-lacivert/18 px-[12px] py-[8px] text-[14px] font-bold leading-[1.255] text-lacivert transition hover:bg-lacivert/5 sm:px-[18px]";

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goToPreviousMonth}
          aria-label={c.previousMonthAriaLabel}
          className={navButtonClasses}
        >
          {"←"}
          <span className="hidden sm:inline">{`  ${c.previousMonth}`}</span>
        </button>

        <p className="font-serif text-[22px] leading-[1.4] text-lacivert sm:text-[30px]">
          {monthLabel}
        </p>

        <button
          type="button"
          onClick={goToNextMonth}
          aria-label={c.nextMonthAriaLabel}
          className={navButtonClasses}
        >
          <span className="hidden sm:inline">{`${c.nextMonth}  `}</span>
          {"→"}
        </button>
      </div>

      <div className="grid grid-cols-7 gap-[4px] sm:gap-[10px]">
        {weekdayLabels.map((label, index) => (
          <div
            key={`${label}-${index}`}
            className="flex h-[20px] justify-center text-[10px] font-extrabold uppercase leading-[1.255] tracking-[1.68px] text-lacivert/55 sm:text-[12px]"
          >
            {label}
          </div>
        ))}

        {grid.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="min-h-[56px] sm:min-h-[96px]" />;
          }

          const key = istanbulDateKey(date);
          const dayEvents = eventsByDay.get(key) ?? [];
          const firstEvent = dayEvents[0];
          // min-h: aynı güne birden fazla etkinlik düştüğünde hücre (ve o
          // haftanın satırı) etkinlik sayısına göre uzayabilsin.
          const cellClasses =
            "flex min-h-[56px] flex-col items-start gap-[6px] overflow-hidden rounded-[8px] border border-lacivert/6 px-[6px] pt-[6px] sm:min-h-[96px] sm:px-[10px] sm:pt-[10px]";

          if (!firstEvent) {
            return (
              <div key={key} className={`${cellClasses} bg-kagit`}>
                <span className="text-[13px] font-extrabold leading-[1.255] text-lacivert/50">
                  {date.getUTCDate()}
                </span>
              </div>
            );
          }

          if (dayEvents.length === 1) {
            return (
              <Link
                key={key}
                href={localePath(locale, `/kitabevi/etkinlikler/${firstEvent.slug}`)}
                title={eventSpeakerName(firstEvent, locale)}
                className={`${cellClasses} bg-murdum transition hover:opacity-90`}
              >
                <span className="text-[13px] font-extrabold leading-[1.255] text-fistik">
                  {date.getUTCDate()}
                </span>
                <span className="line-clamp-2 w-full font-serif text-[14px] leading-[1.12] text-white max-sm:hidden">
                  {eventSpeakerName(firstEvent, locale)}
                </span>
                {firstEvent.hasTime !== false && (
                  <span className="text-[11px] font-bold leading-[1.255] text-white/75 max-sm:hidden">
                    {formatEventTime(firstEvent.date, locale)}
                  </span>
                )}
              </Link>
            );
          }

          // Aynı güne 2+ etkinlik: hücre ince çizgilerle bölümlere ayrılır,
          // her bölüm kendi etkinliğine gider (saat sırasıyla). Mobilde metin
          // gizli, bölümler renkli şeritler olarak kalır.
          const sortedDayEvents = [...dayEvents].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          );
          return (
            <div key={key} className={`${cellClasses} bg-murdum pb-[4px] sm:pb-[6px]`}>
              <span className="text-[13px] font-extrabold leading-[1.255] text-fistik">
                {date.getUTCDate()}
              </span>
              <div className="flex w-full flex-1 flex-col divide-y divide-white/25">
                {sortedDayEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={localePath(locale, `/kitabevi/etkinlikler/${event.slug}`)}
                    title={eventSpeakerName(event, locale)}
                    className="flex w-full flex-1 flex-col max-sm:min-h-[8px] justify-center gap-[1px] py-[3px] transition hover:bg-white/10 sm:py-[5px]"
                  >
                    <span className="line-clamp-1 w-full font-serif text-[13px] leading-[1.15] text-white max-sm:hidden">
                      {eventSpeakerName(event, locale)}
                    </span>
                    {event.hasTime !== false && (
                      <span className="text-[10px] font-bold leading-[1.255] text-white/75 max-sm:hidden">
                        {formatEventTime(event.date, locale)}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
