import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/config/i18n.config";
import { getDictionary } from "@/lib/getDictionary";
import { buildMetadata } from "@/lib/buildMetadata";
import { getPublishedPageBySlug } from "@/lib/services/pages";
import { LegalPageContent } from "@/components/legal/LegalPageContent";

const SLUG = "kvkk-aydinlatma-metni";

const PLACEHOLDER = "[ŞİRKET BİLGİSİ GİRİLECEK]";

const CONTENT = {
  tr: `**Son güncelleme:** ${PLACEHOLDER}

## 1. Veri Sorumlusunun Kimliği

6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz; veri sorumlusu sıfatıyla Booky Kitabevi ("Booky", "Şirket") tarafından aşağıda açıklanan kapsamda işlenebilecektir.

- **Unvan:** ${PLACEHOLDER}
- **Adres:** ${PLACEHOLDER}
- **Vergi Dairesi / Vergi No:** ${PLACEHOLDER}
- **Telefon:** ${PLACEHOLDER}
- **E-posta:** ${PLACEHOLDER}
- **MERSİS No:** ${PLACEHOLDER}

## 2. İşlenen Kişisel Veriler

Booky, aşağıdaki hizmetler kapsamında sizden aşağıdaki kişisel verileri toplayabilir:

- **Üyelik ve hesap işlemleri:** Ad, soyad, e-posta adresi, telefon numarası, şifre bilgisi
- **Sepet ve sipariş / ödeme (checkout) süreçleri:** Teslimat adresi, fatura bilgileri, sipariş içeriği, ödeme yöntemi bilgisi (kart bilgileriniz doğrudan ödeme sağlayıcı tarafından işlenir, Booky tarafından saklanmaz)
- **İletişim formu:** Ad, soyad, e-posta adresi, telefon numarası, mesaj içeriği
- **Site kullanımı:** Çerezler aracılığıyla toplanan gezinme ve tercih bilgileri (bkz. Gizlilik Sözleşmesi)

## 3. Kişisel Verilerin İşlenme Amaçları

Kişisel verileriniz;

- Üyelik işlemlerinin yürütülmesi ve hesabınızın yönetilmesi,
- Sipariş, teslimat ve ödeme süreçlerinin yürütülmesi,
- İletişim taleplerinizin ve müşteri sorularının yanıtlanması,
- Yasal yükümlülüklerin (fatura düzenleme, muhasebe, mevzuata uygunluk vb.) yerine getirilmesi,
- Site güvenliğinin sağlanması ve kötüye kullanımın önlenmesi,
- Açık rızanızın bulunması halinde pazarlama ve bilgilendirme iletişimlerinin gönderilmesi

amaçlarıyla işlenmektedir.

## 4. Kişisel Verilerin Aktarılabileceği Taraflar

Kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesiyle sınırlı olarak;

- Siparişlerinizin teslimi için anlaşmalı **kargo/lojistik firmaları**,
- Ödeme işlemlerinin gerçekleştirilmesi için **ödeme hizmeti sağlayıcıları / bankalar**,
- Sitenin teknik altyapısını sağlayan **barındırma (hosting) ve bilişim hizmeti sağlayıcıları**,
- Yasal olarak bilgi talep etmeye yetkili **kamu kurum ve kuruluşları**

ile, KVKK'nın 8. ve 9. maddelerinde belirtilen kişisel veri işleme şartları ve amaçları çerçevesinde aktarılabilecektir.

## 5. Kişisel Veri Toplamanın Yöntemi ve Hukuki Sebebi

Kişisel verileriniz; web sitemiz, iletişim formları ve e-posta/telefon gibi kanallar aracılığıyla elektronik ortamda toplanmaktadır. Verileriniz;

- Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması (sipariş süreçleri),
- Hukuki yükümlülüğün yerine getirilmesi (fatura, mevzuat),
- Meşru menfaat (site güvenliği, hizmet kalitesinin artırılması),
- Açık rızanızın bulunması (pazarlama iletişimleri)

hukuki sebeplerine dayanılarak işlenmektedir.

## 6. KVKK Madde 11 Kapsamındaki Haklarınız

KVKK'nın 11. maddesi uyarınca Booky'ye başvurarak;

- Kişisel verilerinizin işlenip işlenmediğini öğrenme,
- İşlenmişse buna ilişkin bilgi talep etme,
- İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,
- Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,
- Eksik veya yanlış işlenmiş olması hâlinde düzeltilmesini isteme,
- KVKK'da öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme,
- Düzeltme, silme ve yok etme işlemlerinin, kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,
- İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,
- Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme

haklarına sahipsiniz.

## 7. Başvuru Yöntemi

Yukarıda sayılan haklarınıza ilişkin taleplerinizi, kimliğinizi tevsik edici belgelerle birlikte aşağıdaki iletişim kanallarından Booky'ye iletebilirsiniz:

- **Adres:** ${PLACEHOLDER}
- **E-posta:** ${PLACEHOLDER}

Talebiniz, niteliğine göre en geç 30 (otuz) gün içinde sonuçlandırılacaktır.
`,
  en: `**Last updated:** ${PLACEHOLDER}

## 1. Identity of the Data Controller

Under Turkish Law No. 6698 on the Protection of Personal Data ("KVKK"), your personal data may be processed by Booky Kitabevi ("Booky", "the Company") acting as the data controller, within the scope described below.

- **Legal name:** ${PLACEHOLDER}
- **Address:** ${PLACEHOLDER}
- **Tax office / Tax ID:** ${PLACEHOLDER}
- **Phone:** ${PLACEHOLDER}
- **Email:** ${PLACEHOLDER}
- **MERSİS No:** ${PLACEHOLDER}

## 2. Personal Data We Collect

Booky may collect the following personal data through the services below:

- **Membership and account:** First and last name, email address, phone number, password
- **Cart, order and checkout:** Delivery address, billing details, order contents, payment method information (your card details are processed directly by our payment provider and are not stored by Booky)
- **Contact form:** First and last name, email address, phone number, message content
- **Site usage:** Browsing and preference data collected via cookies (see our Privacy Policy)

## 3. Purposes of Processing

Your personal data is processed for the following purposes:

- Managing your membership and account,
- Carrying out order, delivery and payment processes,
- Responding to your inquiries and customer support requests,
- Fulfilling legal obligations (invoicing, accounting, regulatory compliance, etc.),
- Ensuring site security and preventing misuse,
- Sending marketing and promotional communications where you have given explicit consent

## 4. Parties Your Data May Be Transferred To

Within the limits necessary to achieve the purposes above, your personal data may be shared with:

- **Shipping/logistics companies** for order delivery,
- **Payment service providers / banks** to process payments,
- **Hosting and IT service providers** that support our technical infrastructure,
- **Public authorities** legally entitled to request information

in accordance with the data processing conditions set out in Articles 8 and 9 of the KVKK.

## 5. Method of Collection and Legal Basis

Your personal data is collected electronically through our website, contact forms, and channels such as email or phone. It is processed on the basis of:

- Being necessary for the establishment or performance of a contract (order processes),
- Compliance with a legal obligation (invoicing, regulation),
- Our legitimate interest (site security, service quality),
- Your explicit consent (marketing communications)

## 6. Your Rights Under Article 11 of the KVKK

Under Article 11 of the KVKK, you may apply to Booky to:

- Learn whether your personal data is being processed,
- Request information if it has been processed,
- Learn the purpose of processing and whether it is used accordingly,
- Know the third parties to whom your data is transferred, domestically or abroad,
- Request correction of incomplete or inaccurate data,
- Request deletion or destruction of your data within the conditions set out in the KVKK,
- Request that corrections, deletions or destructions be notified to third parties to whom your data has been transferred,
- Object to a result that is to your detriment arising from analysis of your data exclusively through automated systems,
- Request compensation for damages arising from unlawful processing of your data

## 7. How to Apply

You may submit requests regarding the rights listed above, together with documents verifying your identity, through the following contact channels:

- **Address:** ${PLACEHOLDER}
- **Email:** ${PLACEHOLDER}

Your request will be concluded within 30 (thirty) days at the latest, depending on its nature.
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
    path: "/legal/kvkk-aydinlatma-metni",
    title: page?.seoTitle || page?.title || dict.legal.kvkk.title,
    description: page?.seoDescription || page?.content.slice(0, 160) || dict.legal.kvkk.title,
    image: page?.ogImage ?? undefined,
    canonicalUrl: page?.canonicalUrl ?? undefined,
    noIndex: page?.noIndex,
  });
}

export default async function KvkkPage({
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
      title={page?.title || dict.legal.kvkk.title}
      content={page?.content || CONTENT[locale]}
    />
  );
}
