import "dotenv/config";
import { prisma } from "../lib/prisma";
import { siteConfig } from "../config/site.config";

// Admin paneldeki mevcut Slider kayıtlarının görsellerini
// config/site.config.ts > heroSlides'taki yeni görsellere (BOOKY_Web
// Assets/04 Slider) çevirir. Kayıtlar ctaHref ile eşleştirilir; başlık,
// metin ve buton alanlarına dokunulmaz. Eski değerler geri alma için yazdırılır.
async function main() {
  for (const slide of siteConfig.heroSlides) {
    const rows = await prisma.slider.findMany({ where: { ctaHref: slide.ctaHref } });
    for (const row of rows) {
      console.log(`[${row.titleTr}] eski: desktop=${row.imageDesktop} mobile=${row.imageMobile ?? "-"}`);
      await prisma.slider.update({
        where: { id: row.id },
        data: { imageDesktop: slide.image, imageMobile: slide.mobileImage },
      });
      console.log(`[${row.titleTr}] yeni: desktop=${slide.image} mobile=${slide.mobileImage}`);
    }
    if (rows.length === 0) console.log(`Eşleşen kayıt yok: ${slide.ctaHref}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
