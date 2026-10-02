import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site.config";
import { aboutContent } from "@/data/about";
import type { Locale } from "@/config/i18n.config";

// Bir sosyal alan yalnızca hem "aktif" (toggle açık) hem de bir değeri
// varsa görünür olmalı. `enabled` DB'de hiç satır yoksa `undefined` gelir;
// bu durumda şemadaki `@default` ile aynı davranışı taklit etmek için
// `fallbackEnabled` kullanılır (Instagram/WhatsApp için true, diğerleri
// için false — mevcut canlı davranışla birebir aynı).
function resolveSocial(
  enabled: boolean | undefined,
  value: string | null | undefined,
  fallbackEnabled: boolean,
  fallbackValue: string | null,
): string | null {
  const isEnabled = enabled ?? fallbackEnabled;
  if (!isEnabled) return null;
  return value || fallbackValue;
}

// Admin panelin Genel Ayarlar ekranından yönetilen değerleri okur. Alan
// veritabanında henüz doldurulmamışsa (ör. ilk kurulum), config/site.config.ts
// içindeki mevcut sabit değere düşer — böylece panelden hiçbir şey
// girilmeden site hiçbir zaman boş görünmez.
export async function getSiteSettings() {
  const settings = await prisma.siteSetting.findUnique({ where: { id: "singleton" } });

  return {
    logoUrl: settings?.logoUrl || siteConfig.logo,
    // Mobil logo girilmemişse masaüstü logosu kullanılır.
    logoMobileUrl: settings?.logoMobileUrl || settings?.logoUrl || siteConfig.logo,
    favicon: settings?.faviconUrl || null,
    aboutImageUrl: settings?.aboutImageUrl || null,
    aboutLeadTr: settings?.aboutLeadTr || null,
    aboutLeadEn: settings?.aboutLeadEn || null,
    aboutBodyTr: settings?.aboutBodyTr || null,
    aboutBodyEn: settings?.aboutBodyEn || null,
    address: settings?.address || siteConfig.contact.address,
    phone: settings?.phone || siteConfig.contact.phone,
    email: settings?.email || siteConfig.contact.email,
    workingHours: settings?.workingHours || null,
    mapEmbedUrl: settings?.mapEmbedUrl || null,
    seoTitleDefault: settings?.seoTitleDefault || null,
    seoDescriptionDefault: settings?.seoDescriptionDefault || null,
    ogImageDefault: settings?.ogImageDefault || null,
    whatsapp: resolveSocial(settings?.whatsappEnabled, settings?.whatsapp, true, siteConfig.social.whatsapp),
    socialInstagram: resolveSocial(
      settings?.socialInstagramEnabled,
      settings?.socialInstagram,
      true,
      siteConfig.social.instagram,
    ),
    socialFacebook: resolveSocial(settings?.socialFacebookEnabled, settings?.socialFacebook, false, null),
    socialX: resolveSocial(settings?.socialXEnabled, settings?.socialX, false, null),
    socialYoutube: resolveSocial(settings?.socialYoutubeEnabled, settings?.socialYoutube, false, null),
    socialLinkedin: resolveSocial(settings?.socialLinkedinEnabled, settings?.socialLinkedin, false, null),
    socialTiktok: resolveSocial(settings?.socialTiktokEnabled, settings?.socialTiktok, false, null),
    socialSpotify: resolveSocial(settings?.socialSpotifyEnabled, settings?.socialSpotify, false, null),
    socialSubstack: resolveSocial(settings?.socialSubstackEnabled, settings?.socialSubstack, false, null),
  };
}

export type ResolvedSiteSettings = Awaited<ReturnType<typeof getSiteSettings>>;

// Admin panelde "Hakkımızda" için girilen kısa özet (lead) ve tam metin
// (body, markdown) alanlarını seçilen dile göre çözer. Admin hiçbir şey
// girmemişse (ilk kurulum), data/about.ts'teki statik içeriğe düşer —
// böylece panelden hiçbir şey girilmeden bu bölüm asla boş görünmez.
// `teaser`, ana sayfadaki özet bölümü için body'nin ilk paragrafıdır —
// admin body'yi düzenlemediyse data/about.ts'teki ilk paragrafla birebir
// aynıdır, düzenlediyse onun ilk paragrafını yansıtır.
export function resolveAboutContent(
  settings: ResolvedSiteSettings,
  locale: Locale,
): { lead: string; body: string; teaser: string } {
  const fallback = aboutContent[locale];
  const fallbackBody = [...fallback.paragraphs, `_${fallback.closing}_`].join("\n\n");

  const lead = (locale === "tr" ? settings.aboutLeadTr : settings.aboutLeadEn) || fallback.lead;
  const body = (locale === "tr" ? settings.aboutBodyTr : settings.aboutBodyEn) || fallbackBody;
  const teaser = body.split(/\n{2,}/)[0]?.trim() || fallback.paragraphs[0];

  return { lead, body, teaser };
}
