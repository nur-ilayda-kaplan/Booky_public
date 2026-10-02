"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { eventSpeakerName } from "@/lib/eventSpeaker";
import { formatEventCardDate, istanbulDateKey } from "@/lib/formatDate";
import { localePath } from "@/lib/localePath";
import type { EventItem } from "@/types";
import type { Locale } from "@/config/i18n.config";

const VISIBLE_EVENT_COUNT = 3;

// Mobil "Yaklaşan Etkinlikler" (Figma 2:518): takvim yerine etkinliği olan
// günlerin yatay kaydırılan çipleri (52×64, 8px aralık) ve seçili günden
// itibaren 3 etkinlik kartı. İlk gün seçili gelir (Figma'daki gibi).
export function MobileEventsList({
  events,
  locale,
  allEventsHref,
  allEventsLabel,
}: {
  events: EventItem[];
  locale: Locale;
  allEventsHref: string;
  allEventsLabel: string;
}) {
  const intlLocale = locale === "tr" ? "tr-TR" : "en-US";

  const days = useMemo(() => {
    const weekdayFormatter = new Intl.DateTimeFormat(intlLocale, {
      weekday: "short",
      timeZone: "Europe/Istanbul",
    });
    const seen = new Map<string, { key: string; weekday: string; day: number }>();
    for (const event of events) {
      const date = new Date(event.date);
      const key = istanbulDateKey(date);
      if (!seen.has(key)) {
        seen.set(key, {
          key,
          weekday: weekdayFormatter.format(date).replace(".", ""),
          day: Number(key.split("-")[2]),
        });
      }
    }
    return [...seen.values()];
  }, [events, intlLocale]);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const activeKey = selectedKey ?? days[0]?.key;

  const visibleEvents = events
    .filter((event) => !activeKey || istanbulDateKey(new Date(event.date)) >= activeKey)
    .slice(0, VISIBLE_EVENT_COUNT);

  if (events.length === 0) return null;

  return (
    <div className="flex flex-col gap-[24px]">
      <div className="no-scrollbar -mr-[20px] flex gap-[8px] overflow-x-auto pr-[20px]">
        {days.map((day) => {
          const isActive = day.key === activeKey;
          return (
            <button
              key={day.key}
              type="button"
              aria-pressed={isActive}
              onClick={() => setSelectedKey(day.key)}
              className={`flex h-[64px] w-[52px] shrink-0 flex-col items-center justify-center gap-[2px] rounded-[10px] border border-lacivert/8 ${
                isActive ? "bg-murdum" : "bg-white"
              }`}
            >
              <span
                className={`text-[10px] font-extrabold uppercase leading-[1.255] tracking-[1px] ${
                  isActive ? "text-fistik" : "text-lacivert/50"
                }`}
              >
                {day.weekday}
              </span>
              <span
                className={`font-serif text-[20px] leading-[1.4] ${
                  isActive ? "text-white" : "text-lacivert"
                }`}
              >
                {day.day}
              </span>
            </button>
          );
        })}
      </div>

      {visibleEvents.map((event) => (
        <Link
          key={event.id}
          href={localePath(locale, `/kitabevi/etkinlikler/${event.slug}`)}
          className="flex items-center gap-[16px] rounded-[8px] bg-white p-[12px]"
        >
          <div className="relative aspect-[4/5] w-[96px] shrink-0 overflow-hidden rounded-[12px] bg-brand-accent/40">
            {event.coverImage && (
              <Image
                src={event.coverImage}
                alt={event.title}
                fill
                sizes="96px"
                className="object-cover"
              />
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
            <p className="text-[11px] font-extrabold uppercase leading-[1.255] tracking-[1.1px] text-murdum">
              {formatEventCardDate(event.date, locale, event.hasTime !== false)}
            </p>
            <p className="font-serif text-[20px] leading-[1.4] text-lacivert">{eventSpeakerName(event, locale)}</p>
            {event.shortDescription && (
              <p className="line-clamp-2 font-accent text-[15px] font-medium italic leading-[1.4] whitespace-pre-line text-lacivert/75">
                {event.shortDescription}
              </p>
            )}
          </div>
        </Link>
      ))}

      <Link
        href={allEventsHref}
        className="whitespace-pre text-[15px] font-bold leading-[1.255] text-murdum"
      >
        {`${allEventsLabel}  →`}
      </Link>
    </div>
  );
}
