import type { Author } from "@/types";

// Gerçek yazarlar artık admin panelden (/admin/authors) yönetiliyor ve
// Author DB tablosundan okunuyor (bkz. lib/services/authors.ts). Bu dizi,
// DB'de hiç yazar yokken (örn. ilk kurulum) boş bir sayfa göstermemek için
// bir yedek — normal koşullarda hiç kullanılmaz.
export const authors: Author[] = [];
