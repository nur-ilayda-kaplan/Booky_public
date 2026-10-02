import { prisma } from "@/lib/prisma";
import type { MenuLocation } from "@prisma/client";
import type { Locale } from "@/config/i18n.config";
import type { NavEntry } from "@/types/nav";

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

// Admin panelden yönetilen menü öğelerini NavEntry[] formatına çevirir.
// DB'de o menü için hiç öğe yoksa boş dizi döner — çağıran taraf (Header/
// Footer) bu durumda mevcut sabit menüye düşer, böylece panelden hiçbir
// şey girilmeden site menüsüz kalmaz.
export async function getMenuEntries(location: MenuLocation, locale: Locale): Promise<NavEntry[]> {
  const items = await prisma.menuItem.findMany({
    where: { menu: location, active: true, parentId: null },
    orderBy: { order: "asc" },
    include: {
      children: {
        where: { active: true },
        orderBy: { order: "asc" },
      },
    },
  });

  return items.map((item) => {
    const label = locale === "en" && item.labelEn ? item.labelEn : item.labelTr;

    if (item.children.length > 0) {
      return {
        label,
        showOnMobile: item.showOnMobile,
        children: item.children.map((child) => {
          const childLabel = locale === "en" && child.labelEn ? child.labelEn : child.labelTr;
          return {
            href: child.url,
            label: childLabel,
            external: isExternalUrl(child.url),
            newTab: child.openInNewTab,
          };
        }),
      };
    }

    return {
      href: item.url,
      label,
      external: isExternalUrl(item.url),
      newTab: item.openInNewTab,
      showOnMobile: item.showOnMobile,
    };
  });
}
