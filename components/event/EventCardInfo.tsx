import { eventSpeakerName } from "@/lib/eventSpeaker";
import { formatEventCardDate } from "@/lib/formatDate";
import type { EventItem } from "@/types";
import type { Locale } from "@/config/i18n.config";

// Etkinlik kartlarının (ana sayfa HomeEventCard + etkinlikler sayfası
// EventCard) görsel altındaki bilgi bloğu: kategori hapı, Young Serif
// konuşmacı adı, altında italik kısa açıklama, ince ayırıcı ve mürdüm tarih
// satırı. Başlık ve uzun açıklama yalnızca detay sayfasında gösterilir.
export function EventCardInfo({ event, locale }: { event: EventItem; locale: Locale }) {
  return (
    <div className="flex w-full min-w-0 flex-col items-start gap-[10px]">
      {event.category && (
        <span className="max-w-full rounded-full bg-lacivert/[0.06] px-[12px] py-[6px] text-[11px] font-extrabold uppercase leading-[1.255] tracking-[1.1px] break-words text-lacivert/70">
          {event.category}
        </span>
      )}
      <h3 className="max-w-full font-serif text-[26px] leading-[1.12] break-words text-lacivert group-hover:text-murdum">
        {eventSpeakerName(event, locale)}
      </h3>
      {event.shortDescription && (
        <p className="line-clamp-2 max-w-full font-accent text-[17px] font-medium italic leading-[1.35] break-words whitespace-pre-line text-lacivert">
          {event.shortDescription}
        </p>
      )}
      <hr className="w-full border-t border-lacivert/10" />
      <p className="text-[13px] font-extrabold uppercase leading-[1.255] tracking-[1.3px] text-murdum">
        {formatEventCardDate(event.date, locale, event.hasTime !== false)}
      </p>
    </div>
  );
}
