import type { BlogPost } from "@/types";

// Gerçek blog yazıları artık admin panelden (/admin/blog) yönetiliyor ve
// BlogPost DB tablosundan okunuyor (bkz. lib/services/blog.ts). Bu dizi,
// DB'de hiç yazı yokken (örn. ilk kurulum) boş bir sayfa göstermemek için
// bir yedek — normal koşullarda hiç kullanılmaz.
export const blogPosts: BlogPost[] = [];
