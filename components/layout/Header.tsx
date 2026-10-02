import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { siteConfig } from "@/config/site.config";
import { localePath } from "@/lib/localePath";
import type { Locale } from "@/config/i18n.config";
import type { Dictionary } from "@/lib/getDictionary";
import type { ResolvedSiteSettings } from "@/lib/services/siteSettings";
import { getMenuEntries } from "@/lib/services/menu";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileNav } from "./MobileNav";
import { OverflowNav } from "./OverflowNav";
import { AuthStatus } from "./AuthStatus";
import { SearchOverlay } from "./SearchOverlay";
import type { NavEntry } from "@/types/nav";

export async function Header({
  locale,
  dict,
  settings,
}: {
  locale: Locale;
  dict: Dictionary;
  settings: ResolvedSiteSettings;
}) {
  const fallbackNavItems: NavEntry[] = [
    { href: "/", label: dict.nav.home },
    {
      label: dict.nav.kitabevi.title,
      children: [
        { href: "/bookstore", label: dict.nav.bookstore },
        { href: "/kitabevi/hakkimizda", label: dict.nav.kitabevi.hakkimizda },
        { href: "/kitabevi/blog", label: dict.nav.kitabevi.blog },
        { href: "/kitabevi/etkinlikler", label: dict.nav.kitabevi.etkinlikler },
        {
          href: "/kitabevi/kimler-geldi",
          label: dict.nav.kitabevi.kimlerGeldi,
        },
      ],
    },
    {
      label: dict.nav.yayinevi.title,
      children: [
        { href: "/yayinevi/biz-kimiz", label: dict.nav.yayinevi.bizKimiz },
        {
          href: "/yayinevi/yazarlarimiz",
          label: dict.nav.yayinevi.yazarlarimiz,
        },
      ],
    },
    { href: "/contact", label: dict.nav.contact },
  ];

  const menuEntries = await getMenuEntries("MAIN", locale);
  const navItems = menuEntries.length > 0 ? menuEntries : fallbackNavItems;

  const session = await auth();
  const user = session?.user
    ? {
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        role: session.user.role,
      }
    : null;

  return (
    // Figma "Üst menü" (2:88): 1440 genişlikte px-72 py-22, logo 127.214×52,
    // logo↔menü 40px, sağ grup öğeleri arası 20px → toplam yükseklik 97px
    // (bkz. HeaderScrollWrapper'daki yer tutucu yüksekliği).
    <header className="border-b border-lacivert/8 bg-kagit">
      {/* Mobil (Figma 2:471): px-20 py-14, solda 97.857×40 logo, sağda menü
          ikonu → 69px. Arama, dil ve hesap bağlantıları mobil menüde. */}
      <div className="relative flex items-center justify-between gap-6 px-[20px] py-[14px] sm:px-8 sm:py-3 lg:px-[72px] lg:py-[22px]">
        <Link href={localePath(locale, "/")} className="flex shrink-0 sm:hidden">
          <Image
            src={settings.logoMobileUrl}
            alt={siteConfig.brandName}
            width={98}
            height={40}
            priority
            className="h-[40px] w-auto max-w-[50vw] object-contain"
          />
        </Link>
        <div className="hidden min-w-0 flex-1 items-center gap-[40px] sm:flex">
          <Link href={localePath(locale, "/")} className="flex shrink-0">
            <Image
              src={settings.logoUrl}
              alt={siteConfig.brandName}
              width={127}
              height={52}
              priority
              className="h-[52px] w-auto"
            />
          </Link>
          <OverflowNav
            items={navItems}
            locale={locale}
            moreLabel={dict.common.more}
            className="flex flex-1 text-[15px] font-semibold leading-[1.255] text-lacivert"
          />
        </div>
        <div className="hidden shrink-0 items-center gap-[20px] sm:flex">
          <SearchOverlay locale={locale} dict={dict} />
          <LocaleSwitcher currentLocale={locale} />
          <AuthStatus user={user} locale={locale} dict={dict} />
        </div>
        <MobileNav
          locale={locale}
          items={navItems}
          dict={dict}
          menuLabel={dict.common.menu}
          closeLabel={dict.common.close}
          accountSlot={<AuthStatus user={user} locale={locale} dict={dict} />}
        />
      </div>
    </header>
  );
}
