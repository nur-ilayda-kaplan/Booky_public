# Booky — Kitabevi & Yayınevi Şablonu

Next.js (App Router) + TypeScript + Tailwind CSS ile hazırlanmış, demo verilerle çalışan, yeniden kullanılabilir bir kitabevi / yayınevi e-ticaret şablonu. Ödeme, kargo ve stok entegrasyonları şu an mock; ileride gerçek bir CMS ve ödeme sağlayıcısına bağlanacak şekilde config-driven ve component-based kurulmuştur.

## Kurulum

```bash
npm install
npm run dev     # http://localhost:3000
```

Diğer komutlar: `npm run build`, `npm run start`, `npm run lint`.

`.env.example` dosyasını `.env.local` olarak kopyalayıp `NEXT_PUBLIC_GA_ID` ve `NEXT_PUBLIC_SITE_URL` değerlerini isteğe bağlı olarak doldurun.

## Klasör Yapısı

```
/app/[locale]        Tüm sayfalar tek bir locale segmenti altında (tr|en)
/app/sitemap.ts       /sitemap.xml
/app/robots.ts        /robots.txt
/components
  ui/                 Buton, ikon, SectionHeading gibi genel bileşenler
  layout/             Header, Footer, LocaleSwitcher, MobileNav
  product/            Ürün listeleme, filtre, arama, kart, detay bileşenleri
  blog/, event/, author/, cart/, forms/
/config               site.config.ts, i18n.config.ts
/data                 Demo veriler (products, categories, blogPosts, events, authors, press)
/types                TypeScript tipleri
/hooks                useCart, useFilter, useSearch, useLocale, useAnalytics
/lib                  formatPrice, formatDate, analytics, payment/, services/
/locales              tr.json, en.json (arayüz metinleri)
/public/images        logo, hero görselleri, sosyal medya ikonları
```

## Config'i Güncelleme

`config/site.config.ts` marka adı, logo, renkler, hero slider, sosyal medya ve iletişim bilgilerinin **tek kaynağıdır**. Bu dosyayı değiştirmek header, footer, iletişim sayfası ve SEO metadata'sını otomatik günceller — ayrıca `app/[locale]/layout.tsx` içindeki `colors` alanı doğrudan CSS custom property olarak enjekte edildiğinden, marka renklerini değiştirmek için Tailwind config'ine dokunmanıza gerek yoktur.

**Önemli:** `müşteri bilgileri.txt` dosyasında yalnızca marka adı (Booky), kitabevi sahibi (Buket Erol), Instagram bağlantısı ve WhatsApp numarası bulunuyordu. Aşağıdaki alanlar `site.config.ts` içinde **PLACEHOLDER** olarak işaretlendi ve gerçek bilgiler elde edildiğinde güncellenmelidir:
- `contact.address` (açık adres)
- `contact.email`
- `contact.mapCoordinates` (şu an İstanbul merkez varsayıldı)
- `social.spotify`

## Mimari Kararlar (belirsiz noktalar)

1. **i18n**: `next-intl` yerine hafif bir custom çözüm kullanıldı — `proxy.ts` (Next.js 16'da `middleware.ts`'in yeni adı) `/tr` ve `/en` önekini yönetir, çeviriler `locales/tr.json` ve `locales/en.json`'da tutulur, `lib/getDictionary.ts` sunucu tarafında sözlüğü okur.
2. **Route isimlendirme**: Tüm route'lar tek bir İngilizce slug seti kullanır (`/bookstore`, `/authors` vb.), yalnızca başına `/tr` veya `/en` eklenir. Sayfa **içeriği** locale'e göre değişir, URL kelimesi değişmez — bu, iki ayrı route ağacı yönetmekten kaçınmak için tercih edildi.
3. **İçerik dili kapsamı**: Arayüz metinleri (nav, butonlar, form etiketleri, kategori adları) tam olarak TR/EN çevrildi. Demo içerik (ürün açıklamaları, blog yazıları, etkinlik açıklamaları, yazar biyografileri) gerçekçi olması için yalnızca Türkçe tutuldu — gerçek çok dilli içerik eklenirken bu verilerin de `tr`/`en` alanlarına bölünmesi gerekir.
4. **404 sayfası**: Next.js 16'da dinamik bir `[locale]` segmenti altındaki `not-found.tsx`, `generateStaticParams`'ın yalnızca "ilk" locale'i için doğru parametreleri alıyor (framework kısıtı) — bu nedenle 404 sayfası iki dili birden gösterir; ayrıca tamamen eşleşmeyen path'lerin de bu sayfaya düşmesi için bir `[...catchAll]` route'u eklendi.
5. **Ödeme**: `lib/payment/` altında bir `PaymentProvider` arayüzü ve `MockPaymentProvider` implementasyonu var. Gerçek entegrasyon için (İyzico/Stripe/PayTR vb.) yeni bir sınıf yazıp `lib/payment/index.ts` içindeki `paymentProvider` export'unu değiştirmek yeterli.
6. **CMS'e hazır servis katmanı**: `lib/services/*.ts` içindeki tüm fonksiyonlar (`getProducts`, `getBlogPosts`, `getEvents`, `getAuthors` vb.) `async` olarak tanımlı ve şu an `/data/*.ts` dosyalarından okuyor. İleride bir headless CMS (Sanity, Contentful, Strapi) veya e-ticaret backend'i (Shopify, Medusa) ile değiştirilirken bu fonksiyonların imzaları (aynı dönüş tipleri) korunmalı; çağıran bileşenlerde değişiklik gerekmez.
7. **Tailwind v4**: Proje Tailwind v4 ile geldiğinden `tailwind.config.ts` yerine `app/globals.css` içinde `@theme inline` kullanılıyor; marka renkleri CSS custom property olarak `config/site.config.ts`'ten enjekte ediliyor (madde 1'e bakınız).

## Genişletme Noktaları

- **Ödeme**: `lib/payment/mockPaymentProvider.ts` → gerçek sağlayıcı ile değiştirin.
- **CMS**: `lib/services/*.ts` içindeki fonksiyonları CMS SDK çağrılarıyla değiştirin, `/data/*.ts` dosyalarına artık ihtiyaç kalmaz.
- **Analitik**: `lib/analytics.ts` GA4 için hazır; `NEXT_PUBLIC_GA_ID` tanımlandığında otomatik devreye girer.
- **Yeni dil eklemek**: `config/i18n.config.ts`'teki `locales` dizisine ekleyin, `locales/<yeni-dil>.json` dosyasını oluşturun, `lib/getDictionary.ts`'e ekleyin.
