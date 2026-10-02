export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorId: string;
  // Elle girilen yazar adı; doluysa authorId'den çözülen yazarın adının önüne geçer.
  authorName?: string;
  // authorName'den türetilen anahtar; yazara göre filtreleme bununla yapılır.
  authorSlug?: string;
  publishedAt: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
}
