import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

// Admin'de slug boş bırakılabilir (etkinlikte yalnızca tarih zorunlu): o
// zaman başlık → konuşmacı → "etkinlik" sırasıyla ilk dolu değerden ve
// tarihten bir slug üretilir, çakışırsa -2, -3… eklenir. Elle girilen
// slug'a dokunulmaz; çakışma kontrolü çağıran route'ta yapılır.
export async function generateEventSlug(
  input: { title?: string; speaker?: string; date: Date },
  excludeId?: string,
): Promise<string> {
  const base = slugify(input.title || input.speaker || "") || "etkinlik";
  const day = input.date.toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
  const stem = `${base}-${day}`;
  for (let i = 1; ; i += 1) {
    const candidate = i === 1 ? stem : `${stem}-${i}`;
    const existing = await prisma.event.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
  }
}
