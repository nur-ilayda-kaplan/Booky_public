import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site.config";
import type { Locale } from "@/config/i18n.config";
import type { Dictionary } from "@/lib/getDictionary";
import type { HeroSlide } from "@/components/home/HeroSlider";

// Admin panelden yönetilen "Slider" kayıtlarını anasayfanın beklediği
// biçime çevirir. DB'de aktif slider yoksa (henüz panelden hiçbiri
// eklenmemişse) config/site.config.ts içindeki sabit sliderlara düşer.
export async function getHeroSlides(locale: Locale, dict: Dictionary): Promise<HeroSlide[]> {
  const sliders = await prisma.slider.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });

  if (sliders.length === 0) {
    return siteConfig.heroSlides.map((slide, index) => ({
      id: `fallback-${index}`,
      image: slide.image,
      mobileImage: slide.mobileImage,
      imagePosition: "center",
      title: slide.title[locale],
      subtitle: slide.subtitle[locale],
      description: "",
      ctaHref: slide.ctaHref,
      ctaLabel: dict.home[slide.ctaLabelKey],
    }));
  }

  return sliders.map((slider) => ({
    id: slider.id,
    image: slider.imageDesktop,
    mobileImage: slider.imageMobile || null,
    imagePosition: slider.imagePosition,
    title: (locale === "en" && slider.titleEn ? slider.titleEn : slider.titleTr) ?? "",
    subtitle: (locale === "en" && slider.subtitleEn ? slider.subtitleEn : slider.subtitleTr) ?? "",
    description:
      (locale === "en" && slider.descriptionEn ? slider.descriptionEn : slider.descriptionTr) ?? "",
    ctaHref: slider.ctaHref ?? "/",
    ctaLabel: (locale === "en" && slider.ctaLabelEn ? slider.ctaLabelEn : slider.ctaLabelTr) ?? "",
  }));
}
