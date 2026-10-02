"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { defaultLocale, locales, type Locale } from "@/config/i18n.config";
import { localePath } from "@/lib/localePath";

// Adres çubuğu tr için önek göstermiyor, bu yüzden usePathname() tr'de
// "/blog", en'de "/en/blog" döner — hedef dile geçerken önce mevcut
// önek varsa (en) onu soyup çıplak path'i elde ediyoruz, sonra hedef dil
// için localePath ile doğru öneki (ya da tr için önek'sizliği) ekliyoruz.
function pathForLocale(pathname: string, currentLocale: Locale, target: Locale): string {
  const currentPrefix = `/${currentLocale}`;
  const bare =
    currentLocale !== defaultLocale &&
    (pathname === currentPrefix || pathname.startsWith(`${currentPrefix}/`))
      ? pathname.slice(currentPrefix.length) || "/"
      : pathname;
  return localePath(target, bare);
}

export function LocaleSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();

  return (
    // Figma "TR / EN" (2:103): Mulish Bold 14px, harf aralığı 1.12px, lacivert.
    <div className="flex items-center gap-[4px] text-[14px] font-bold leading-[1.255] tracking-[1.12px] text-lacivert">
      {locales.map((locale, index) => (
        <span key={locale} className="flex items-center gap-1">
          {index > 0 && <span>/</span>}
          <Link
            href={pathForLocale(pathname, currentLocale, locale)}
            onClick={() => {
              document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
            }}
            aria-current={locale === currentLocale ? "true" : undefined}
            className="hover:text-murdum"
          >
            {locale.toUpperCase()}
          </Link>
        </span>
      ))}
    </div>
  );
}
