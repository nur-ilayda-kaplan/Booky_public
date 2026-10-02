import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/config/i18n.config";
import { getDictionary } from "@/lib/getDictionary";
import { buildMetadata } from "@/lib/buildMetadata";
import { getPublishedPageBySlug } from "@/lib/services/pages";
import { LegalPageContent } from "@/components/legal/LegalPageContent";

const SLUG = "ucret-politikasi";

const PLACEHOLDER = "[ŞİRKET BİLGİSİ GİRİLECEK]";

const CONTENT = {
  tr: `**Son güncelleme:** ${PLACEHOLDER}

Bu sayfa, Booky Kitabevi üzerinden yapılan alışverişlere ilişkin fiyatlandırma, ödeme, kargo ücretleri ve iade süreçleri hakkında genel bilgi vermek amacıyla hazırlanmıştır.

## 1. Fiyatlandırma

- Sitede yer alan tüm fiyatlar Türk Lirası (TL) cinsinden ve KDV dahil olarak belirtilmiştir.
- Ürün fiyatları, stok durumu ve kampanyalara bağlı olarak önceden haber verilmeksizin değiştirilebilir. Sipariş onayı sırasında geçerli olan fiyat esas alınır.

## 2. Ödeme Yöntemleri

Siparişleriniz için aşağıdaki ödeme yöntemlerini kullanabilirsiniz:

- Kredi kartı / banka kartı ile online ödeme
- ${PLACEHOLDER} (varsa kapıda ödeme, havale/EFT vb. diğer yöntemler)

Kart bilgileriniz, güvenli ödeme altyapısı sağlayıcısı üzerinden işlenir; Booky tarafından saklanmaz.

## 3. Kargo Ücretleri

- Kargo ücreti, sipariş tutarına ve teslimat adresine göre checkout adımında hesaplanır ve sipariş onayından önce açıkça gösterilir.
- ${PLACEHOLDER} tutarın üzerindeki siparişlerde kargo ücretsizdir (uygulanıyorsa).

## 4. İptal ve İade

- Siparişiniz kargoya verilmeden önce iptal talebinde bulunabilirsiniz.
- Cayma hakkınız kapsamında, ürünü teslim aldığınız tarihten itibaren 14 gün içinde iade talebinde bulunabilirsiniz. İade edilecek ürünün kullanılmamış ve satılabilir durumda olması gerekir.
- İade onaylandıktan sonra ödeme, kullandığınız ödeme yöntemine 14 iş günü içinde iade edilir.
- İade kargo ücretinin kime ait olduğu (Booky veya alıcı): ${PLACEHOLDER}.

## 5. İletişim

Ücretlendirme ve iade süreçleriyle ilgili sorularınız için bizimle iletişime geçebilirsiniz:

- **E-posta:** ${PLACEHOLDER}
- **Telefon:** ${PLACEHOLDER}
`,
  en: `**Last updated:** ${PLACEHOLDER}

This page provides general information about pricing, payment, shipping fees, and cancellation/return procedures for purchases made through Booky Kitabevi.

## 1. Pricing

- All prices on the Site are listed in Turkish Lira (TRY) and include VAT.
- Product prices may change without prior notice depending on stock levels and campaigns. The price valid at the time your order is confirmed applies.

## 2. Payment Methods

You may use the following payment methods for your orders:

- Online payment by credit or debit card
- ${PLACEHOLDER} (other methods such as cash on delivery or bank transfer, if offered)

Your card details are processed through our secure payment infrastructure provider and are not stored by Booky.

## 3. Shipping Fees

- Shipping fees are calculated at checkout based on your order total and delivery address, and are clearly shown before you confirm your order.
- Orders above ${PLACEHOLDER} qualify for free shipping (if applicable).

## 4. Cancellations and Returns

- You may request cancellation before your order is shipped.
- Under your right of withdrawal, you may request a return within 14 days of receiving your product. Returned items must be unused and in resalable condition.
- Once your return is approved, your payment will be refunded to your original payment method within 14 business days.
- Responsibility for return shipping costs (Booky or the buyer): ${PLACEHOLDER}.

## 5. Contact

For questions about pricing or returns, please contact us:

- **Email:** ${PLACEHOLDER}
- **Phone:** ${PLACEHOLDER}
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
    path: "/legal/ucret-politikasi",
    title: page?.seoTitle || page?.title || dict.legal.pricing.title,
    description: page?.seoDescription || page?.content.slice(0, 160) || dict.legal.pricing.title,
    image: page?.ogImage ?? undefined,
    canonicalUrl: page?.canonicalUrl ?? undefined,
    noIndex: page?.noIndex,
  });
}

export default async function PricingPolicyPage({
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
      title={page?.title || dict.legal.pricing.title}
      content={page?.content || CONTENT[locale]}
    />
  );
}
