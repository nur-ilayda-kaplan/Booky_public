import type { PressMention } from "@/types";

// Gerçek basın haberleri artık admin panelden (/admin/press) yönetiliyor ve
// PressMention DB tablosundan okunuyor (bkz. lib/services/press.ts). Bu
// dizi, DB'de hiç haber yokken (örn. ilk kurulum) boş bir sayfa göstermemek
// için bir yedek — normal koşullarda hiç kullanılmaz.
export const press: PressMention[] = [];
