import { PastEventGalleryCard } from "@/components/event/PastEventGalleryCard";
import type { EventGalleryItem } from "@/types";
import type { Locale } from "@/config/i18n.config";
import type { Dictionary } from "@/lib/getDictionary";

// Mobilde (sm altı) yatay kaydırılan, snap'li tek satır: kart ekranın
// ~%74'ü, bir sonraki kartın ~20–40px'lik kenarı görünür. Satır sol kenarda sayfa
// boşluğunu taşıyıp ekran kenarına kadar uzanır; sağda ise ekran kenarından
// 48px önce biter — sağa sabit sosyal medya şeridi (FloatingSocialButtons,
// mobilde ~44px) kartların üstüne binmesin diye. sm ve üstünde eski grid.
const GUTTER_CLASSES = {
  // HomeSection mobilde px-[20px]
  home: "-ml-[20px] pl-[20px] scroll-pl-[20px] mr-[28px]",
  // PageContainer mobilde pl-4 pr-4 (16px)
  page: "-ml-4 pl-4 scroll-pl-4 mr-[32px]",
} as const;

export function PastEventGalleryList({
  galleries,
  locale,
  dict,
  gutter,
  layout = "scroll",
}: {
  galleries: EventGalleryItem[];
  locale: Locale;
  dict: Dictionary;
  gutter: keyof typeof GUTTER_CLASSES;
  // "scroll": ana sayfa — mobilde yatay kaydırılan satır.
  // "grid": Kimler Geldi sayfası — mobilde aşağı kayan 2 sütun (kompakt
  // kart); sağda yine sosyal medya şeridi kadar pay bırakılır.
  layout?: "scroll" | "grid";
}) {
  if (layout === "grid") {
    return (
      <div className="mr-[32px] grid grid-cols-2 gap-x-[12px] gap-y-[24px] sm:mr-0 sm:gap-x-[24px] sm:gap-y-[32px] lg:grid-cols-4">
        {galleries.map((gallery) => (
          <PastEventGalleryCard key={gallery.id} gallery={gallery} locale={locale} dict={dict} compact />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`no-scrollbar flex snap-x snap-mandatory gap-[10px] overflow-x-auto ${GUTTER_CLASSES[gutter]} sm:m-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-x-[24px] sm:gap-y-[32px] sm:overflow-visible sm:p-0 lg:grid-cols-4`}
    >
      {galleries.map((gallery) => (
        <div key={gallery.id} className="w-[74vw] shrink-0 snap-start sm:w-auto">
          <PastEventGalleryCard gallery={gallery} locale={locale} dict={dict} />
        </div>
      ))}
    </div>
  );
}
