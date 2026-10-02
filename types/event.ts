export interface EventItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  date: string;
  // false ise yalnızca tarih girilmiş, saat gösterilmez (varsayılan true).
  hasTime?: boolean;
  location: string;
  category?: string;
  speaker?: string;
  coverImage: string;
  calendarThumbnailUrl?: string;
  capacity?: number;
  authorIds?: string[];
  authorNames?: string[];
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
}

// "Kimler Geldi?" fotoğraf galerisi — etkinliğe bağlanması opsiyonel; ad
// ve tarih boşsa bağlı etkinliğinkiler kullanılır.
export interface EventGalleryItem {
  id: string;
  images: string[];
  name?: string;
  // ISO tarih (yalnızca gün, İstanbul 00.00).
  date?: string;
  note?: string;
  event?: EventItem;
}
