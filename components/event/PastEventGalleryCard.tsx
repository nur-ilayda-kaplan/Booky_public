import Image from "next/image";
import Link from "next/link";
import { eventSpeakerName } from "@/lib/eventSpeaker";
import { formatEventCardDate } from "@/lib/formatDate";
import { localePath } from "@/lib/localePath";
import type { EventGalleryItem } from "@/types";
import type { Locale } from "@/config/i18n.config";
import type { Dictionary } from "@/lib/getDictionary";

// Nokta göstergesi 74vw'lik mobil kartta taşmasın diye üst sınır.
const MAX_DOTS = 12;

// "Kimler Geldi?" kartı (ana sayfa + /kitabevi/kimler-geldi): etkinlik
// kartlarıyla aynı 4:5 yuvarlatılmış görsel (galerinin ilk fotoğrafı) ve
// alt kenarda fotoğraf sayısı kadar nokta; altında ad (galerinin kendi adı, yoksa bağlı
// etkinliğin konuşmacısı), not (yoksa etkinlik adı) ve tarih. Etkinliğe
// bağlıysa etkinlik detayına, değilse galeri sayfasına gider — ikisinde de
// tüm fotoğraflar görünür.
export function PastEventGalleryCard({
  gallery,
  locale,
  dict,
  compact = false,
}: {
  gallery: EventGalleryItem;
  locale: Locale;
  dict: Dictionary;
  // Kimler Geldi sayfasının mobil 2 sütunlu grid'i için: sm altında daha
  // küçük yazı, not gizli (yalnızca ad + tarih). sm ve üstünde fark yok.
  compact?: boolean;
}) {
  const { event } = gallery;
  const speaker = gallery.name || (event ? eventSpeakerName(event, locale) : "");
  const subheading =
    gallery.note || (event?.title && event.title !== speaker ? event.title : undefined);
  const date = gallery.date ?? event?.date;
  const href = event
    ? `/kitabevi/etkinlikler/${event.slug}`
    : `/kitabevi/kimler-geldi/${gallery.id}`;

  return (
    <Link
      href={localePath(locale, href)}
      className={`group flex min-w-0 flex-col items-start ${compact ? "gap-[10px] sm:gap-[14px]" : "gap-[14px]"}`}
    >
      <div
        className={`relative aspect-[4/5] w-full overflow-hidden bg-brand-accent/40 ${
          compact ? "rounded-[12px] sm:rounded-[16px]" : "rounded-[16px]"
        }`}
      >
        <Image
          src={gallery.images[0]}
          alt={speaker}
          fill
          sizes={`(min-width: 1024px) 282px, (min-width: 640px) 45vw, ${compact ? "40vw" : "74vw"}`}
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        {gallery.images.length > 1 && (
          <>
            {/* Instagram'daki çoklu fotoğraf göstergesi gibi: fotoğraf sayısı
                kadar nokta (çok fotoğraflı galeride en fazla MAX_DOTS),
                ilki dolu. Yalnızca görsel; sayı ekran okuyucuya metinle. */}
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-[10px] flex justify-center gap-[5px]"
            >
              {Array.from({ length: Math.min(gallery.images.length, MAX_DOTS) }, (_, index) => (
                <span
                  key={index}
                  className={`size-[6px] rounded-full shadow-[0_0_2px_rgba(0,0,0,0.45)] ${
                    index === 0 ? "bg-white" : "bg-white/55"
                  }`}
                />
              ))}
            </span>
            <span className="sr-only">
              {dict.guests.photoCount.replace("{count}", String(gallery.images.length))}
            </span>
          </>
        )}
      </div>
      <div className={`flex w-full min-w-0 flex-col items-start ${compact ? "gap-[6px] sm:gap-[10px]" : "gap-[10px]"}`}>
        <h3
          className={`max-w-full font-serif leading-[1.12] break-words text-lacivert group-hover:text-murdum ${
            compact ? "text-[18px] sm:text-[26px]" : "text-[26px]"
          }`}
        >
          {speaker}
        </h3>
        {subheading && (
          <p
            className={`line-clamp-2 max-w-full font-accent text-[17px] font-medium italic leading-[1.35] break-words whitespace-pre-line text-lacivert ${
              compact ? "max-sm:hidden" : ""
            }`}
          >
            {subheading}
          </p>
        )}
        {date && (
          <>
            <hr className={`w-full border-t border-lacivert/10 ${compact ? "max-sm:hidden" : ""}`} />
            <p
              className={`font-extrabold uppercase leading-[1.255] text-murdum ${
                compact ? "text-[11px] tracking-[1.1px] sm:text-[13px] sm:tracking-[1.3px]" : "text-[13px] tracking-[1.3px]"
              }`}
            >
              {formatEventCardDate(date, locale, false)}
            </p>
          </>
        )}
      </div>
    </Link>
  );
}
