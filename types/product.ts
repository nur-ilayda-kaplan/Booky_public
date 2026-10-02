export interface Product {
  id: string;
  slug: string;
  title: string;
  authorId: string;
  categoryId: string;
  price: number;
  showPrice?: boolean;
  coverImage: string;
  description: string;
  stock?: number;
  pageCount: number;
  publishedYear: number;
  isbn: string;
  publisher?: string;
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
}
