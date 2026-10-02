import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { localePath } from "@/lib/localePath";
import { getMenuEntries } from "@/lib/services/menu";
import { getSocialLinks } from "@/lib/socialLinks";
import { NavLinkItem } from "./NavLinkItem";
import { isNavGroup, type NavEntry, type NavLink as NavLinkType } from "@/types/nav";
import type { Locale } from "@/config/i18n.config";
import type { Dictionary } from "@/lib/getDictionary";
import type { ResolvedSiteSettings } from "@/lib/services/siteSettings";

const QUICK_LINKS = [
  { href: "/bookstore", label: (dict: Dictionary) => dict.nav.bookstore },
  { href: "/kitabevi/hakkimizda", label: (dict: Dictionary) => dict.nav.kitabevi.hakkimizda },
  { href: "/kitabevi/etkinlikler", label: (dict: Dictionary) => dict.nav.kitabevi.etkinlikler },
  { href: "/yayinevi/yazarlarimiz", label: (dict: Dictionary) => dict.nav.yayinevi.yazarlarimiz },
  { href: "/contact", label: (dict: Dictionary) => dict.nav.contact },
] as const;

const LEGAL_LINKS = [
  { href: "/legal/kvkk-aydinlatma-metni", label: (dict: Dictionary) => dict.legal.kvkk.title },
  { href: "/legal/gizlilik-sozlesmesi", label: (dict: Dictionary) => dict.legal.privacy.title },
  { href: "/legal/acik-riza-metni", label: (dict: Dictionary) => dict.legal.consent.title },
  { href: "/legal/ucret-politikasi", label: (dict: Dictionary) => dict.legal.pricing.title },
] as const;

// Figma mobil altbilgide yalnızca ilk iki yasal metin (KVKK, Gizlilik) var.
const MOBILE_LEGAL_LINK_COUNT = 2;

const FOOTER_LINK_CLASSES = "transition-colors hover:text-white";

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-[14px] lg:flex-1">
      <p className="text-[13px] font-extrabold uppercase leading-[1.255] tracking-[2.34px] text-fistik">
        {title}
      </p>
      <ul className="flex flex-col gap-[14px] text-[16px] font-semibold leading-[1.5] text-white/85">
        {children}
      </ul>
    </div>
  );
}

function flattenToLinks(entries: NavEntry[]): NavLinkType[] {
  return entries.flatMap((entry) => (isNavGroup(entry) ? entry.children : [entry]));
}

export async function Footer({
  locale,
  dict,
  settings,
}: {
  locale: Locale;
  dict: Dictionary;
  settings: ResolvedSiteSettings;
}) {
  const year = new Date().getFullYear();

  const footerMenuEntries = await getMenuEntries("FOOTER", locale);
  const quickLinks: NavLinkType[] =
    footerMenuEntries.length > 0
      ? flattenToLinks(footerMenuEntries)
      : QUICK_LINKS.map((link) => ({ href: link.href, label: link.label(dict) }));

  const socialLinks = getSocialLinks(settings);

  // Figma "Altbilgi" (2:432): lacivert zemin, pt-88 pb-40 px-120; dört eşit
  // sütun arası 64px; sütun başlıkları fıstık yeşili Mulish ExtraBold 13px.
  return (
    <footer className="mt-16 bg-lacivert text-white">
      {/* Mobil (Figma 2:621): tek sütun, pt-48 pb-56 px-20, öğeler arası 24px;
          sütun başlıkları yok, bağlantılar tek listede. */}
      <div className="flex flex-col items-start gap-[24px] px-[20px] pb-[56px] pt-[48px] sm:hidden">
        <Link href={localePath(locale, "/")} className="flex">
          <Image
            src={siteConfig.logoDark}
            alt={siteConfig.brandName}
            width={117}
            height={48}
            className="h-[48px] w-auto"
          />
        </Link>
        <ul className="flex flex-col gap-[10px] text-[15px] font-semibold leading-[1.255] text-white/85">
          {quickLinks.map((link) => (
            <li key={link.href}>
              <NavLinkItem item={link} locale={locale} className={FOOTER_LINK_CLASSES} />
            </li>
          ))}
          {LEGAL_LINKS.slice(0, MOBILE_LEGAL_LINK_COUNT).map((link) => (
            <li key={link.href}>
              <Link href={localePath(locale, link.href)} className={FOOTER_LINK_CLASSES}>
                {link.label(dict)}
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-[14px] font-semibold leading-[1.5] text-white/80">{settings.address}</p>
        <a
          href={`mailto:${settings.email}`}
          className="text-[14px] font-bold leading-[1.255] text-fistik"
        >
          {settings.email}
        </a>
        <a
          href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`}
          className="text-[14px] font-bold leading-[1.255] text-fistik"
        >
          {settings.phone}
        </a>
        {socialLinks.length > 0 && (
          <ul className="flex flex-wrap gap-[8px]" aria-label={dict.footer.followUs}>
            {socialLinks.map(({ href, label }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-full border border-white/30 px-[14px] py-[7px] text-[12px] font-bold leading-[1.255] text-white"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="text-[12px] font-semibold leading-[1.255] text-white/50">
          © {year} {siteConfig.brandName}. {dict.footer.rights}
        </p>
      </div>

      <div className="mx-auto flex max-w-[1440px] flex-col gap-[64px] px-4 pb-[40px] pt-[88px] max-sm:hidden sm:px-8 lg:px-[120px]">
        <div className="grid gap-[48px] sm:grid-cols-2 lg:flex lg:gap-[64px]">
          <div className="flex min-w-0 flex-col items-start lg:flex-1">
            <Link href={localePath(locale, "/")} className="flex">
              <Image
                src={siteConfig.logoDark}
                alt={siteConfig.brandName}
                width={147}
                height={60}
                className="h-[60px] w-auto"
              />
            </Link>
          </div>

          <FooterColumn title={dict.footer.quickLinks}>
            {quickLinks.map((link) => (
              <li key={link.href}>
                <NavLinkItem item={link} locale={locale} className={FOOTER_LINK_CLASSES} />
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title={dict.legal.footerTitle}>
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={localePath(locale, link.href)} className={FOOTER_LINK_CLASSES}>
                  {link.label(dict)}
                </Link>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title={dict.footer.contactUs}>
            <li className="whitespace-pre-line">{settings.address}</li>
            <li>
              <a
                href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`}
                className={FOOTER_LINK_CLASSES}
              >
                {settings.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${settings.email}`} className={FOOTER_LINK_CLASSES}>
                {settings.email}
              </a>
            </li>
          </FooterColumn>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/12 pt-[28px] sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[14px] font-semibold leading-[1.255] text-white/60">
            © {year} {siteConfig.brandName}. {dict.footer.rights}
          </p>
          {socialLinks.length > 0 && (
            <ul className="flex flex-wrap gap-[10px]" aria-label={dict.footer.followUs}>
              {socialLinks.map(({ href, label }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-full border border-white/30 px-[16px] py-[8px] text-[13px] font-bold leading-[1.255] text-white transition-colors hover:border-fistik hover:text-fistik"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
