import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/config/i18n.config";
import { getDictionary } from "@/lib/getDictionary";
import { buildMetadata } from "@/lib/buildMetadata";
import { getPublishedPageBySlug } from "@/lib/services/pages";
import { LegalPageContent } from "@/components/legal/LegalPageContent";

const SLUG = "gizlilik-sozlesmesi";

const PLACEHOLDER = "[ŞİRKET BİLGİSİ GİRİLECEK]";

const CONTENT = {
  tr: `**Son güncelleme:** ${PLACEHOLDER}

Bu Gizlilik Sözleşmesi, Booky Kitabevi ("Booky") tarafından işletilen web sitesini ("Site") kullanımınız sırasında toplanan bilgilerin nasıl toplandığını, kullanıldığını ve korunduğunu açıklamaktadır.

## 1. Topladığımız Bilgiler

Siteyi kullanırken aşağıdaki bilgileri toplayabiliriz:

- **Hesap bilgileri:** Ad, soyad, e-posta, telefon, şifre
- **Sipariş bilgileri:** Teslimat adresi, sipariş geçmişi, ödeme yöntemi bilgisi
- **İletişim bilgileri:** İletişim formu üzerinden gönderdiğiniz ad, e-posta ve mesaj içeriği
- **Çerezler (cookies) ve benzer teknolojiler:** Oturum bilgisi, sepet içeriği, site tercihleri, sitedeki gezinme davranışınıza ilişkin veriler

Çerezler; sitenin düzgün çalışmasını sağlamak, tercihlerinizi hatırlamak ve site kullanımını analiz etmek amacıyla kullanılır. Tarayıcı ayarlarınızdan çerezleri yönetebilir veya devre dışı bırakabilirsiniz; ancak bu durumda sitenin bazı özellikleri düzgün çalışmayabilir.

## 2. Bilgilerin Kullanım Amacı

Topladığımız bilgiler;

- Siparişlerinizin işlenmesi ve teslimatın sağlanması,
- Hesabınızın oluşturulması ve yönetilmesi,
- Müşteri desteği sağlanması,
- Site performansının ve kullanıcı deneyiminin iyileştirilmesi,
- Yasal yükümlülüklerin yerine getirilmesi,
- Açık rızanız bulunması hâlinde tarafınıza kampanya ve duyuru bilgilendirmeleri gönderilmesi

amaçlarıyla kullanılır.

## 3. Bilgilerin Korunması

Booky, kişisel verilerinizin güvenliğini sağlamak amacıyla makul teknik ve idari tedbirleri almaktadır. Ödeme bilgileriniz doğrudan yetkili ödeme sağlayıcıları tarafından işlenir; kart bilgileriniz Booky sunucularında saklanmaz.

## 4. Üçüncü Taraflarla Paylaşım

Bilgileriniz, hizmetin sağlanması için gerekli olduğu ölçüde kargo firmaları, ödeme sağlayıcıları ve teknik altyapı sağlayıcıları ile paylaşılabilir. Bilgileriniz, yasal zorunluluklar dışında pazarlama amacıyla üçüncü taraflarla satılmaz veya kiralanmaz.

## 5. Kullanıcı Hakları

Kişisel verilerinize erişme, bunların düzeltilmesini veya silinmesini talep etme ve pazarlama iletişimlerinden çıkma hakkına sahipsiniz. Detaylı bilgi için KVKK Aydınlatma Metni'ni inceleyebilir veya bizimle iletişime geçebilirsiniz.

## 6. Sözleşmede Değişiklik

Booky, bu Gizlilik Sözleşmesi'ni zaman zaman güncelleyebilir. Güncel metin her zaman bu sayfada yayımlanır ve yayımlandığı tarihte yürürlüğe girer.

## 7. İletişim

Bu politika hakkındaki sorularınız için:

- **E-posta:** ${PLACEHOLDER}
- **Adres:** ${PLACEHOLDER}
`,
  en: `**Last updated:** ${PLACEHOLDER}

This Privacy Policy explains how Booky Kitabevi ("Booky") collects, uses and protects information gathered while you use our website (the "Site").

## 1. Information We Collect

While using the Site, we may collect:

- **Account information:** Name, email, phone number, password
- **Order information:** Delivery address, order history, payment method information
- **Contact information:** Name, email and message content submitted through our contact form
- **Cookies and similar technologies:** Session information, cart contents, site preferences, and data about your browsing behavior on the Site

Cookies are used to keep the Site functioning properly, remember your preferences, and analyze how the Site is used. You can manage or disable cookies through your browser settings, though some features of the Site may not work properly as a result.

## 2. How We Use This Information

We use the information we collect to:

- Process your orders and arrange delivery,
- Create and manage your account,
- Provide customer support,
- Improve site performance and user experience,
- Fulfill legal obligations,
- Send you campaign and announcement communications where you have given explicit consent

## 3. How We Protect Your Information

Booky takes reasonable technical and administrative measures to keep your personal data secure. Payment information is processed directly by our authorized payment provider; your card details are not stored on Booky's servers.

## 4. Sharing With Third Parties

Your information may be shared with shipping companies, payment providers and technical infrastructure providers to the extent necessary to deliver our services. We do not sell or rent your information to third parties for marketing purposes, except as required by law.

## 5. Your Rights

You have the right to access your personal data, request its correction or deletion, and opt out of marketing communications. For more detail, please see our Personal Data Protection Notice (KVKK) or contact us.

## 6. Changes to This Policy

Booky may update this Privacy Policy from time to time. The current version is always published on this page and takes effect as of its publication date.

## 7. Contact

For questions about this policy:

- **Email:** ${PLACEHOLDER}
- **Address:** ${PLACEHOLDER}
`,
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "tr";
  const dict = getDictionary(locale);
  const page = await getPublishedPageBySlug(SLUG);

  return buildMetadata({
    locale,
    path: "/legal/gizlilik-sozlesmesi",
    title: page?.seoTitle || page?.title || dict.legal.privacy.title,
    description: page?.seoDescription || page?.content.slice(0, 160) || dict.legal.privacy.title,
    image: page?.ogImage ?? undefined,
    canonicalUrl: page?.canonicalUrl ?? undefined,
    noIndex: page?.noIndex,
  });
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);
  const page = await getPublishedPageBySlug(SLUG);

  return (
    <LegalPageContent
      title={page?.title || dict.legal.privacy.title}
      content={page?.content || CONTENT[locale]}
    />
  );
}
