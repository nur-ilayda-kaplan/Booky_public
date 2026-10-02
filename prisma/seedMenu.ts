import { prisma } from "../lib/prisma";

// Header.tsx / Footer.tsx içindeki sabit "fallback" menülerin (DB'de hiç
// MenuItem yokken kullanılan) birebir karşılığını admin panelden yönetilen
// gerçek MenuItem kayıtları olarak DB'ye yazar. Bu script idempotent'tir —
// her çalıştırmada önce MAIN/FOOTER menülerindeki mevcut kayıtları temizler,
// sonra kanonik yapıyı yeniden oluşturur (tekrar tekrar çalıştırmak güvenli).
//
// Neden gerekli: getMenuEntries() DB'de o menü için TEK bir öğe bile varsa
// artık sabit fallback'e hiç bakmıyor — yanlışlıkla eklenmiş tek bir kayıt
// (örn. admin panel denerken oluşan bir "test" öğesi) tüm gerçek menünün
// yerine geçebiliyor. Menüyü DB'de kalıcı ve doğru tutmak bu riski ortadan
// kaldırır.
async function main() {
  await prisma.menuItem.deleteMany({ where: { menu: "MAIN" } });
  await prisma.menuItem.deleteMany({ where: { menu: "FOOTER" } });

  await prisma.menuItem.create({
    data: {
      menu: "MAIN",
      labelTr: "Ana Sayfa",
      labelEn: "Home",
      linkType: "INTERNAL",
      url: "/",
      order: 0,
    },
  });

  await prisma.menuItem.create({
    data: {
      menu: "MAIN",
      labelTr: "Kitabevi",
      labelEn: "Bookstore",
      linkType: "INTERNAL",
      url: "#",
      order: 1,
      children: {
        create: [
          {
            menu: "MAIN",
            labelTr: "Kitaplar",
            labelEn: "Books",
            linkType: "INTERNAL",
            url: "/bookstore",
            order: 0,
          },
          {
            menu: "MAIN",
            labelTr: "Hakkımızda",
            labelEn: "About Us",
            linkType: "INTERNAL",
            url: "/kitabevi/hakkimizda",
            order: 1,
          },
          {
            menu: "MAIN",
            labelTr: "Blog",
            labelEn: "Blog",
            linkType: "INTERNAL",
            url: "/kitabevi/blog",
            order: 2,
          },
          {
            menu: "MAIN",
            labelTr: "Etkinlikler",
            labelEn: "Events",
            linkType: "INTERNAL",
            url: "/kitabevi/etkinlikler",
            order: 3,
          },
          {
            menu: "MAIN",
            labelTr: "Kimler Geldi?",
            labelEn: "Who Visited?",
            linkType: "INTERNAL",
            url: "/kitabevi/kimler-geldi",
            order: 4,
          },
        ],
      },
    },
  });

  await prisma.menuItem.create({
    data: {
      menu: "MAIN",
      labelTr: "Yayınevi",
      labelEn: "Publishing House",
      linkType: "INTERNAL",
      url: "#",
      order: 2,
      children: {
        create: [
          {
            menu: "MAIN",
            labelTr: "Biz Kimiz",
            labelEn: "Meet the Team",
            linkType: "INTERNAL",
            url: "/yayinevi/biz-kimiz",
            order: 0,
          },
          {
            menu: "MAIN",
            labelTr: "Booky'de Kimler Var",
            labelEn: "Our Authors",
            linkType: "INTERNAL",
            url: "/yayinevi/yazarlarimiz",
            order: 1,
          },
        ],
      },
    },
  });

  await prisma.menuItem.create({
    data: {
      menu: "MAIN",
      labelTr: "İletişim",
      labelEn: "Contact",
      linkType: "INTERNAL",
      url: "/contact",
      order: 3,
    },
  });

  const footerLinks = [
    { labelTr: "Kitaplar", labelEn: "Books", url: "/bookstore" },
    { labelTr: "Hakkımızda", labelEn: "About Us", url: "/kitabevi/hakkimizda" },
    { labelTr: "Etkinlikler", labelEn: "Events", url: "/kitabevi/etkinlikler" },
    {
      labelTr: "Booky'de Kimler Var",
      labelEn: "Our Authors",
      url: "/yayinevi/yazarlarimiz",
    },
    { labelTr: "İletişim", labelEn: "Contact", url: "/contact" },
  ];

  for (const [index, link] of footerLinks.entries()) {
    await prisma.menuItem.create({
      data: {
        menu: "FOOTER",
        labelTr: link.labelTr,
        labelEn: link.labelEn,
        linkType: "INTERNAL",
        url: link.url,
        order: index,
      },
    });
  }

  const mainCount = await prisma.menuItem.count({ where: { menu: "MAIN" } });
  const footerCount = await prisma.menuItem.count({
    where: { menu: "FOOTER" },
  });
  console.log(`MAIN menü: ${mainCount} kayıt (üst + alt öğeler dahil)`);
  console.log(`FOOTER menü: ${footerCount} kayıt`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
