// Values below marked "PLACEHOLDER" are not present in `müşteri bilgileri.txt` yet.
// Update this file once the real values are available (see README.md).
export const siteConfig = {
  brandName: "Booky",
  owner: "Buket Erol",
  tagline: {
    tr: "Kitapla buluşan her an bir hikaye başlar.",
    en: "Every moment with a book begins a new story.",
  },
  description: {
    tr: "Booky Kitabevi & Yayınevi — özenle seçilmiş kitaplar, yazar buluşmaları ve etkinliklerle dolu bir dünya.",
    en: "Booky Bookstore & Publishing House — a world of carefully chosen books, author events and gatherings.",
  },
  // Kurumsal logo seti (BOOKY_Web Assets/01 Logo): 234.857×96 viewBox, oran ≈2.45:1.
  // Sitede logo kullanılan her yer açık zeminli; koyu zemin sürümü koyu
  // arka planlı alanlar için hazır bekliyor.
  logo: "/images/logo/logo-booky-acik-zemin.svg",
  logoDark: "/images/logo/logo-booky-koyu-zemin.svg",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bookykitabevi.com",

  colors: {
    primary: "#792258",
    secondary: "#C9A876",
    accent: "#E8DFC8",
  },

  // Görseller: BOOKY_Web Assets/04 Slider (masaüstü 3840×2160, mobil 780×1470).
  heroSlides: [
    {
      image: "/images/hero/slider-01-hos-geldiniz-masaustu.jpg",
      mobileImage: "/images/hero/slider-01-hos-geldiniz-mobil.jpg",
      title: { tr: "Booky'ye Hoş Geldiniz", en: "Welcome to Booky" },
      subtitle: {
        tr: "Kitap tutkunları için özenle seçilmiş bir koleksiyon",
        en: "A carefully curated collection for book lovers",
      },
      ctaHref: "/yayinevi/biz-kimiz",
      ctaLabelKey: "heroWhoWeAre",
    },
    {
      image: "/images/hero/slider-02-kitabevi-masaustu.jpg",
      mobileImage: "/images/hero/slider-02-kitabevi-mobil.jpg",
      title: { tr: "Kitabevimizden", en: "From Our Bookstore" },
      subtitle: {
        tr: "Raflarımıza yeni eklenen kitapları keşfedin",
        en: "Discover the latest additions to our shelves",
      },
      ctaHref: "/bookstore",
      ctaLabelKey: "heroBookstore",
    },
    {
      image: "/images/hero/slider-03-yazarlarla-bulusun-masaustu.jpg",
      mobileImage: "/images/hero/slider-03-yazarlarla-bulusun-mobil.jpg",
      title: { tr: "Yazarlarla Buluşun", en: "Meet the Authors" },
      subtitle: {
        tr: "Söyleşiler, imza günleri ve daha fazlası",
        en: "Talks, signing days and much more",
      },
      ctaHref: "/yayinevi/yazarlarimiz",
      ctaLabelKey: "heroOurAuthors",
    },
    {
      image: "/images/hero/slider-04-etkinlik-takvimi-masaustu.jpg",
      mobileImage: "/images/hero/slider-04-etkinlik-takvimi-mobil.jpg",
      title: { tr: "Etkinlik Takvimi", en: "Events Calendar" },
      subtitle: {
        tr: "Yaklaşan söyleşi ve atölyeleri kaçırmayın",
        en: "Don't miss upcoming talks and workshops",
      },
      ctaHref: "/kitabevi/etkinlikler",
      ctaLabelKey: "heroEvents",
    },
  ],

  social: {
    instagram: "https://www.instagram.com/bookykitabevi/",
    whatsapp: "+905384551965",
  },

  contact: {
    // PLACEHOLDER — açık adres müşteri bilgileri dosyasında yer almıyor.
    address:
      "Adnan Saygun Cad. Kültür Mah. Feza sok. Ulus Apt. Sitesi 2. Blok No:2/1, Ulus, 34340 Beşiktaş/İstanbul",
    phone: "+905384551965",
    // PLACEHOLDER — e-posta adresi müşteri bilgileri dosyasında yer almıyor.
    email: "info@bookykitabevi.com",
    // PLACEHOLDER — harita koordinatları müşteri bilgileri dosyasında yer almıyor (İstanbul merkez varsayıldı).
    mapCoordinates: {
      lat: 41.0082,
      lng: 28.9784,
    },
  },

  // Ana sayfadaki "Booky Podcast" bölümü en son bölümü bu YouTube kanalının
  // RSS akışından otomatik alır (bkz. lib/services/podcast.ts).
  podcast: {
    youtubeChannelId: "UCsnkefby4BhomUBcl9jXCOw",
    youtubeChannelUrl: "https://www.youtube.com/@BookyKitabevi",
    spotifyShowUrl: "https://open.spotify.com/show/68kql6bpA4nEAajqA2UpJH",
  },

  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID,
  },
} as const;

export type SiteConfig = typeof siteConfig;
