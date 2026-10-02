// Admin panelindeki her görsel yükleme alanı için önerilen boyut/oran/format.
// Değerler tahmini DEĞİL — görselin sitede gerçekten render edildiği bileşenden
// (className/aspect-ratio, next/image width/height/fill/sizes, breakpoint'ler)
// hesaplanmıştır; hangi bileşenden hesaplandığı her girdinin yanında not
// edilmiştir. Retina (2x) öneriler, hesaplanan gerçek render boyutunun 2 katıdır.
// Boyut değişirse tek yapılması gereken burayı güncellemek — admin formları
// buradan okur.
export interface ImageSizeSpec {
  label: string;
  recommendedSize: string;
  aspectRatio: string;
  format: string;
  warning?: string;
}

// Facebook/Twitter/LinkedIn gibi sosyal paylaşım kırıcıları og:image için
// genelde SVG render etmez, sadece raster (PNG/JPG/WebP) gösterir — SVG
// yüklenmesine izin verilse de OG/vitrin görseli alanlarında bu uyarılıyor.
const SVG_OG_WARNING =
  "SVG yüklenebilir, ama sosyal paylaşım kırıcıları (Facebook/Twitter/LinkedIn) og:image için genelde SVG'yi render etmez — PNG/JPG/WebP önerilir.";

export const IMAGE_SIZES = {
  // components/layout/Header.tsx: ≥640px h-[52px], width="auto" (Figma "Üst
  // menü" 127.214×52). Kurumsal logo seti: logo-booky-acik-zemin.svg
  // (234.857×96), PNG'leri 470×192 ve 939×384. Header açık zeminli olduğu
  // için "açık zemin" sürümü kullanılmalı.
  siteLogo: {
    label: "Site Logosu (Masaüstü / Tablet)",
    recommendedSize:
      "SVG: logo-booky-acik-zemin.svg. PNG ise yükseklik en az 156px (3x retina), 939×384 PNG uygundur — masaüstü ve tablette (≥640px) 52px yükseklikte render edilir",
    aspectRatio: "≈2.45:1 (logonun kendi oranı korunur, kırpılmaz)",
    format: "SVG önerilir, PNG (şeffaf zemin) de olur — header açık zeminli olduğu için \"açık zemin\" sürümünü yükleyin",
  } satisfies ImageSizeSpec,

  // components/layout/Header.tsx: <640px h-[40px] yükseklik, genişlik en
  // fazla 50vw — solda, sağında menü ikonu (Figma mobil "Üst menü" 97.857×40).
  siteLogoMobile: {
    label: "Site Logosu (Mobil)",
    recommendedSize:
      "Yükseklik 40px'te render edilir, genişlik en fazla ekranın yarısı. PNG ise yükseklik en az 120px (3x retina), 470×192 PNG uygundur; boş bırakılırsa masaüstü logosu kullanılır",
    aspectRatio: "En fazla ≈3:1 önerilir (daha yatay logolar küçülür); mevcut logo ≈2.45:1 ile sorunsuz sığar",
    format: "SVG önerilir, PNG (şeffaf zemin) de olur — mobil için sadeleştirilmiş bir sürüm (ör. yalnızca \"booky\" yazısı) yüklenebilir",
  } satisfies ImageSizeSpec,

  // Kodda favicon için açık bir boyut referansı yok (app/[locale]/layout.tsx
  // sadece metadata.icons.icon olarak veriyor) — bu yüzden web standardı olan
  // tek kare PNG'den tüm boyutların türetilmesi öneriliyor.
  favicon: {
    label: "Favicon",
    recommendedSize: "512x512px",
    aspectRatio: "1:1 kare",
    format: "PNG önerilir, WebP de desteklenir",
  } satisfies ImageSizeSpec,

  // lib/buildMetadata.ts: og:image için resolvedImage olduğu gibi
  // (width/height override yok) kullanılıyor — standart OG oranı geçerli.
  ogImageDefault: {
    label: "Varsayılan Sosyal Paylaşım (OG) Görseli",
    recommendedSize: "1200x630px",
    aspectRatio: "1.91:1",
    format: "WebP öncelikli, JPG/PNG desteklenir",
    warning: SVG_OG_WARNING,
  } satisfies ImageSizeSpec,

  // app/[locale]/(site)/page.tsx: PageContainer (max-w-7xl=1280px) içinde
  // lg:grid-cols-2, aspect-3/4 — sütun ≈ (1280-40 gap)/2 ≈ 620px, retina 2x.
  aboutImage: {
    label: "Hakkımızda Görseli",
    recommendedSize: "≈1240x1650px (retina)",
    aspectRatio: "3:4 dikey",
    format: "WebP öncelikli, JPG/PNG desteklenir",
  } satisfies ImageSizeSpec,

  // components/home/HeroSlider.tsx: w-full h-[87vh] min-h-[420px], object-cover.
  // 1920x1080 referans masaüstü viewport'unda 87vh ≈ 940px, retina 2x.
  sliderDesktop: {
    label: "Slider — Masaüstü Görseli",
    recommendedSize: "3840x2160px (retina, en az 1920x1080px)",
    aspectRatio: "16:9 (sabit oran yok, tam ekran genişlikte kırpılır)",
    format: "WebP öncelikli, JPG/PNG desteklenir",
  } satisfies ImageSizeSpec,

  // Aynı HeroSlider alanı, sm breakpoint (640px) altında mobileImage
  // gösteriliyor. Ölçüm (canlı, 375–428px): kutu ≈ 360–413×839px, görsel
  // object-cover ile yükseklikten doldurduğu için ekran genişliğinin ~1.25
  // katı çiziliyor. Güncel telefonlar 3x ekran → 430px × 1.25 × 3 ≈ 1290px
  // genişlik gerekiyor. 390x735 yüklenen görseller 3x ekranda ~3.4 kat
  // büyütülüp bulanık görünüyordu.
  sliderMobile: {
    label: "Slider — Mobil Görseli",
    recommendedSize: "1290x2430px (retina 3x, en az 1170x2200px)",
    aspectRatio: "Dikey, sabit oran yok",
    format: "WebP öncelikli, JPG/PNG desteklenir",
  } satisfies ImageSizeSpec,

  // components/admin/SeoFields.tsx — Blog/Kitap/Etkinlik/Sayfa formlarının
  // paylaştığı "Open Graph / Vitrin Görseli" alanı. buildMetadata.ts bunu
  // og:image olarak olduğu gibi kullanıyor (bkz. ogImageDefault notu).
  seoOgImage: {
    label: "SEO — Open Graph / Vitrin Görseli",
    recommendedSize: "1200x630px",
    aspectRatio: "1.91:1",
    format: "WebP öncelikli, JPG/PNG desteklenir",
    warning: SVG_OG_WARNING,
  } satisfies ImageSizeSpec,

  // Kitap detay: app/[locale]/(site)/bookstore/[slug]/page.tsx —
  // lg:grid-cols-[360px_1fr], aspect-2/3 sütun → 360px, retina 2x.
  productCover: {
    label: "Kitap Kapak Görseli",
    recommendedSize: "720x1080px (retina)",
    aspectRatio: "2:3 dikey (standart kitap kapağı oranı)",
    format: "WebP öncelikli, JPG/PNG desteklenir",
  } satisfies ImageSizeSpec,

  // Blog detay: app/[locale]/(site)/kitabevi/blog/[slug]/page.tsx —
  // aspect-16/9, sizes="(min-width: 768px) 720px, 100vw" → 720px, retina 2x.
  blogCover: {
    label: "Blog Kapak Görseli",
    recommendedSize: "1440x810px (retina)",
    aspectRatio: "16:9",
    format: "WebP öncelikli, JPG/PNG desteklenir",
  } satisfies ImageSizeSpec,

  // Etkinlik kapağı tüm kullanımlarda 4:5 dikey (aspect-[4/5]): ana sayfa
  // kartı (HomeEventCard), mobil liste (MobileEventsList), etkinlikler
  // sayfası kartı (EventCard) ve detay sayfası (max-w-[480px]). Booky'nin
  // etkinlik afişi ölçüsü 1638×2048 — detayda 480px'in ~3.4 katı, yeterli.
  eventCover: {
    label: "Etkinlik Kapak Görseli",
    recommendedSize: "1638x2048px",
    aspectRatio: "4:5 dikey",
    format: "WebP öncelikli, JPG/PNG desteklenir",
  } satisfies ImageSizeSpec,

  // "Kimler Geldi?" galerisi: kart (PastEventGalleryCard) ve etkinlik detayı
  // (EventGalleryPhotos) 4:5 dikey kırpar — etkinlik kapağıyla aynı ölçü.
  eventGalleryPhoto: {
    label: "Kimler Geldi? Fotoğrafları",
    recommendedSize: "1638x2048px",
    aspectRatio: "4:5 dikey (farklı oranlar ortadan kırpılır)",
    format: "WebP öncelikli, JPG/PNG desteklenir",
  } satisfies ImageSizeSpec,

  // components/event/EventsCalendar.tsx: aylık takvimde kare gün hücresi,
  // object-cover — coverImage (16:9) kırpılınca konu taşabileceği için
  // admin bu kare kırpım için ayrı, isteğe bağlı bir görsel seçebilir.
  // Boşsa coverImage'a düşülür.
  eventCalendarThumbnail: {
    label: "Takvim Küçük Resmi (opsiyonel)",
    recommendedSize: "512x512px",
    aspectRatio: "1:1 kare",
    format: "WebP öncelikli, JPG/PNG desteklenir",
  } satisfies ImageSizeSpec,

  // /yayinevi/biz-kimiz: en büyük kullanım TeamMemberModal.tsx'te
  // h-40 w-40 (mobil) / sm:h-48 sm:w-48 (192px), yuvarlak; retina 2x.
  teamMemberPhoto: {
    label: "Ekip Üyesi Fotoğrafı",
    recommendedSize: "384x384px (retina)",
    aspectRatio: "1:1 kare (yuvarlak kırpılır)",
    format: "WebP öncelikli, JPG/PNG desteklenir",
  } satisfies ImageSizeSpec,

  // Yazar detay: app/[locale]/(site)/yayinevi/yazarlarimiz/[slug]/page.tsx —
  // h-32 w-32 (128px) yuvarlak avatar, en büyük kullanım; retina 2x.
  authorPhoto: {
    label: "Yazar Profil Fotoğrafı",
    recommendedSize: "256x256px (retina)",
    aspectRatio: "1:1 kare (yuvarlak kırpılır)",
    format: "WebP öncelikli, JPG/PNG desteklenir",
  } satisfies ImageSizeSpec,
} as const satisfies Record<string, ImageSizeSpec>;

export function imageSizeHint(spec: ImageSizeSpec): string {
  return `Önerilen boyut: ${spec.recommendedSize} (${spec.aspectRatio}) — ${spec.format}`;
}
