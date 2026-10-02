import Image from "next/image";
import Link from "next/link";
import { EventCardInfo } from "@/components/event/EventCardInfo";
import { localePath } from "@/lib/localePath";
import type { EventItem } from "@/types";
import type { Locale } from "@/config/i18n.config";

export function EventCard({ event, locale }: { event: EventItem; locale: Locale }) {
  return (
    <Link
      href={localePath(locale, `/kitabevi/etkinlikler/${event.slug}`)}
      className="group flex min-w-0 flex-col overflow-hidden rounded-lg border border-black/5 bg-white transition hover:shadow-md"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-brand-accent/20">
        {event.coverImage && (
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-[10px] p-4">
        <EventCardInfo event={event} locale={locale} />
        {event.location && (
          <span className="mt-auto text-sm text-foreground/50">{event.location}</span>
        )}
      </div>
    </Link>
  );
}
