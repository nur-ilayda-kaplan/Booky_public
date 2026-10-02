import { prisma } from "../lib/prisma";
import { siteConfig } from "../config/site.config";
import trDict from "../locales/tr.json";
import enDict from "../locales/en.json";

// Anasayfada DB'de hiç Slider kaydı yokken kullanılan sabit
// config/site.config.ts > heroSlides sliderlarını admin panelden yönetilen
// gerçek Slider kayıtlarına çevirir — böylece admin/sliders'ta görünür ve
// düzenlenebilir olurlar (bkz. lib/services/sliders.ts'teki fallback).
// Idempotent'tir: imageDesktop alanına göre zaten içe aktarılmış bir slider
// varsa dokunulmaz, böylece admin panelden yapılmış düzenlemeler korunur —
// yalnızca eksik olanlar eklenir.
async function main() {
  let created = 0;
  let skipped = 0;

  for (const [index, slide] of siteConfig.heroSlides.entries()) {
    const existing = await prisma.slider.findFirst({ where: { imageDesktop: slide.image } });
    if (existing) {
      skipped += 1;
      continue;
    }

    await prisma.slider.create({
      data: {
        imageDesktop: slide.image,
        imageMobile: slide.mobileImage,
        imagePosition: "center",
        titleTr: slide.title.tr,
        titleEn: slide.title.en,
        subtitleTr: slide.subtitle.tr,
        subtitleEn: slide.subtitle.en,
        ctaHref: slide.ctaHref,
        ctaLabelTr: trDict.home[slide.ctaLabelKey],
        ctaLabelEn: enDict.home[slide.ctaLabelKey],
        order: index,
        active: true,
      },
    });
    created += 1;
  }

  console.log(`Oluşturulan slider: ${created}`);
  console.log(`Zaten mevcut (dokunulmadı): ${skipped}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
