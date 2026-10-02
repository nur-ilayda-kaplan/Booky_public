import type { Product } from "@/types";

// Gerçek kitaplar artık admin panelden (/admin/products) yönetiliyor ve
// Product DB tablosundan okunuyor (bkz. lib/services/products.ts). Bu dizi,
// DB'de hiç ürün yokken (örn. ilk kurulum) boş bir sayfa göstermemek için
// bir yedek — normal koşullarda hiç kullanılmaz.
export const products: Product[] = [];
