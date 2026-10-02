import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/config/i18n.config";
import { getDictionary } from "@/lib/getDictionary";
import { buildMetadata } from "@/lib/buildMetadata";
import { getPublishedPageBySlug } from "@/lib/services/pages";
import { LegalPageContent } from "@/components/legal/LegalPageContent";

const SLUG = "acik-riza-metni";

const PLACEHOLDER = "[ŞİRKET BİLGİSİ GİRİLECEK]";

const CONTENT = {
  tr: `**Son güncelleme:** ${PLACEHOLDER}

Bu Açık Rıza Metni, Booky Kitabevi ("Booky") tarafından, KVKK Aydınlatma Metni'nde belirtilen zorunlu işleme faaliyetleri dışında kalan, açık rızanıza dayalı olarak yürütülen veri işleme faaliyetleri için hazırlanmıştır.

## Rıza Verilen İşleme Faaliyetleri

Bu metni onaylamanız hâlinde, aşağıdaki opsiyonel iletişimleri almayı kabul etmiş olursunuz:

- Kampanya, indirim ve yeni ürün duyurularını içeren **pazarlama e-postaları**,
- Sipariş durumu dışındaki bilgilendirme ve fırsatlara ilişkin **SMS bildirimleri**,
- Etkinlik, imza günü ve söyleşi duyurularına ilişkin bildirimler

Bu iletişimler, yalnızca yukarıdaki kutucuğu/onayı işaretlemeniz hâlinde tarafınıza gönderilir ve sipariş/hesap işlemlerinizin yürütülmesi için zorunlu değildir.

## Rızanın Geri Çekilmesi

Verdiğiniz açık rızayı istediğiniz zaman, herhangi bir gerekçe göstermeksizin geri çekebilirsiniz. Rızanızı geri çekmek için:

- Aldığınız e-postalardaki **"Aboneliği İptal Et"** bağlantısını kullanabilir,
- Hesap ayarlarınızdan bildirim tercihlerinizi güncelleyebilir,
- ${PLACEHOLDER} e-posta adresi üzerinden bizimle iletişime geçebilirsiniz.

Rızanızı geri çekmeniz, geri çekmeden önce yapılan işlemlerin hukuka uygunluğunu etkilemez.
`,
  en: `**Last updated:** ${PLACEHOLDER}

This Explicit Consent Notice covers data processing activities carried out by Booky Kitabevi ("Booky") that go beyond the mandatory processing described in our Personal Data Protection Notice (KVKK) and rely on your explicit consent.

## Processing Activities You Are Consenting To

By approving this notice, you agree to receive the following optional communications:

- **Marketing emails** about campaigns, discounts and new product announcements,
- **SMS notifications** about offers and updates beyond your order status,
- Notifications about events, signing days and author talks

These communications are sent to you only if you check the box/approval above, and are not required to process your orders or manage your account.

## Withdrawing Your Consent

You may withdraw your explicit consent at any time, without giving any reason. To withdraw your consent:

- Use the **"Unsubscribe"** link in any email you receive,
- Update your notification preferences in your account settings,
- Contact us at ${PLACEHOLDER}

Withdrawing your consent does not affect the lawfulness of any processing carried out before the withdrawal.
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
    path: "/legal/acik-riza-metni",
    title: page?.seoTitle || page?.title || dict.legal.consent.title,
    description: page?.seoDescription || page?.content.slice(0, 160) || dict.legal.consent.title,
    image: page?.ogImage ?? undefined,
    canonicalUrl: page?.canonicalUrl ?? undefined,
    noIndex: page?.noIndex,
  });
}

export default async function ConsentPage({
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
      title={page?.title || dict.legal.consent.title}
      content={page?.content || CONTENT[locale]}
    />
  );
}
