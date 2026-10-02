import type { EventItem } from "@/types";

// Gerçek etkinlikler artık admin panelden (/admin/events) yönetiliyor ve
// Event DB tablosundan okunuyor (bkz. lib/services/events.ts). Bu dizi,
// DB'de hiç etkinlik yokken (örn. ilk kurulum) boş bir sayfa göstermemek
// için bir yedek — normal koşullarda hiç kullanılmaz.
export const events: EventItem[] = [];
