import Image from "next/image";
import Link from "next/link";
import { EventCardInfo } from "@/components/event/EventCardInfo";
import { localePath } from "@/lib/localePath";
import type { EventItem } from "@/types";
import type { Locale } from "@/config/i18n.config";

// Ana sayfa etkinlik kartı: 4:5 dikey kapak (1638×2048 yüklenir, bkz.
// IMAGE_SIZES.eventCover), yumuşak yuvarlatılmış köşeler; altında 14px
// aralıkla bilgi bloğu (EventCardInfo).
export function HomeEventCard({ event, locale }: { event: EventItem; locale: Locale }) {
  return (
    <Link
      href={localePath(locale, `/kitabevi/etkinlikler/${event.slug}`)}
      className="group flex min-w-0 flex-col items-start gap-[14px]"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[16px] bg-brand-accent/40">
        {event.coverImage && (
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            sizes="(min-width: 1024px) 282px, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <EventCardInfo event={event} locale={locale} />
    </Link>
  );
}

// Figma "kart, program" (2:316): mürdüm zemin, 520px yükseklik, p-32,
// başlık/çizim/bağlantı dikeyde iki uca yaslı.
export function MonthProgramCard({
  href,
  title,
  ctaLabel,
}: {
  href: string;
  title: string;
  ctaLabel: string;
}) {
  return (
    <Link
      href={href}
      className="group flex h-[520px] flex-col items-start justify-between bg-murdum p-[32px]"
    >
      <p className="font-serif text-[30px] leading-[1.12] text-white">{title}</p>
      <Image
        src="/images/home/events-program-cizim.png"
        alt=""
        width={218}
        height={218}
        className="size-[218px] object-contain"
      />
      <span className="whitespace-pre text-[15px] font-extrabold leading-[1.255] text-fistik group-hover:underline">
        {`${ctaLabel}  →`}
      </span>
    </Link>
  );
}
