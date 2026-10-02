import { XMLParser, XMLBuilder, XMLValidator } from "fast-xml-parser";
import type { Product } from "@prisma/client";
import { sanitizePlainText } from "@/lib/sanitize";

// Kitaplar (Product) XML içe/dışa aktarma — bkz. app/api/admin/products/import
// ve app/api/admin/products/export. Prisma'daki gerçek Product modeli analiz
// edilerek oluşturuldu: model'de bir "stock" veya "currency" alanı YOK
// (fiyat tek bir Float, lib/formatPrice.ts'te sabit TRY olarak biçimleniyor)
// — bu yüzden "stock" gibi karşılığı olmayan XML alanları sessizce yok
// sayılmaz, satır uyarısı olarak raporlanır (bkz. STOCK_ALIASES kullanımı).

export const MAX_XML_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// next.config.ts > images.remotePatterns ile birebir aynı — next/image bu
// listenin dışındaki bir host için render sırasında hata fırlatır. Import
// edilen bir <cover>/<image> bu listede değilse coverImage boş bırakılır
// (satırın geri kalanı yine de içe aktarılır) ki tek bir kitap tüm ürün
// listeleme/detay sayfalarını kırmasın.
const ALLOWED_COVER_IMAGE_HOSTS = [/^picsum\.photos$/, /\.public\.blob\.vercel-storage\.com$/];

function isAllowedCoverImageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    return ALLOWED_COVER_IMAGE_HOSTS.some((pattern) => pattern.test(url.hostname));
  } catch {
    return false;
  }
}

// XML etiket adları projeler arası büyük farklılık gösterebilir — kullanıcının
// verdiği örnek alan adlarına körü körüne bağlı kalınmaz, hem İngilizce hem
// mevcut projede geçen Türkçe adlandırmalar (bkz. ProductForm.tsx alan
// etiketleri) alias olarak tanınır. Karşılaştırma normalizeKey() ile
// büyük/küçük harf ve alt çizgi/tire farkını yok sayarak yapılır.
const FIELD_ALIASES = {
  isbn: ["isbn", "isbn13", "isbn10"],
  title: ["title", "name", "kitapadi", "ad", "booktitle"],
  author: ["author", "yazar", "authorname"],
  publisher: ["publisher", "yayinevi"],
  description: ["description", "aciklama", "summary"],
  price: ["price", "fiyat", "amount"],
  currency: ["currency", "parabirimi", "doviz"],
  category: ["category", "kategori", "genre"],
  coverImage: ["cover", "image", "coverimage", "kapak", "gorsel", "img"],
  pageCount: ["pagecount", "sayfasayisi", "pages"],
  publishedYear: ["publishedyear", "yayinyili", "year"],
} as const;

// Model'de karşılığı olmayan ama sık geçen alan adları — sessizce atmak
// yerine satır başına "desteklenmiyor" uyarısı üretmek için ayrıca tutulur.
const UNSUPPORTED_FIELD_ALIASES: { field: string; aliases: string[] }[] = [
  { field: "stock", aliases: ["stock", "stok", "quantity", "adet"] },
];

function normalizeKey(key: string): string {
  return key
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğışüö]/g, (ch) => ({ ç: "c", ğ: "g", ı: "i", ş: "s", ü: "u", ö: "o" })[ch] ?? ch)
    .replace(/[^a-z0-9]/g, "");
}

function pickField(node: Record<string, unknown>, aliases: readonly string[]): string | null {
  const normalizedAliases = new Set(aliases.map(normalizeKey));
  for (const key of Object.keys(node)) {
    if (!normalizedAliases.has(normalizeKey(key))) continue;
    const value = node[key];
    if (value === null || value === undefined) continue;

    if (typeof value === "object") {
      // Düz metin beklenen bir alanın içine kaçırılmamış (escape edilmemiş)
      // bir etiket sızmışsa (ör. <description>Bu <script>...</script> metin
      // </description>) fast-xml-parser bunu iç içe bir objeye çevirir —
      // sadece çevresindeki düz metin (#text) alınır, iç etiketin içeriği
      // (ör. script'in kendisi) tamamen atılır, hiçbir şekilde saklanmaz.
      const text = "#text" in (value as Record<string, unknown>) ? String((value as Record<string, unknown>)["#text"]).trim() : "";
      if (text) return text;
      continue;
    }

    const text = String(value).trim();
    if (text) return text;
  }
  return null;
}

export interface ParsedBookRow {
  index: number;
  isbn: string | null;
  title: string | null;
  author: string | null;
  publisher: string | null;
  description: string | null;
  price: number | null;
  currency: string | null;
  category: string | null;
  coverImage: string | null;
  pageCount: number | null;
  publishedYear: number | null;
  errors: string[];
  warnings: string[];
}

function toNumberOrNull(value: string | null): number | null {
  if (!value) return null;
  const normalized = value.replace(",", ".").replace(/[^\d.-]/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function toIntOrNull(value: string | null): number | null {
  const parsed = toNumberOrNull(value);
  return parsed === null ? null : Math.trunc(parsed);
}

export async function normalizeBookRow(node: Record<string, unknown>, index: number): Promise<ParsedBookRow> {
  const errors: string[] = [];
  const warnings: string[] = [];

  const title = pickField(node, FIELD_ALIASES.title);
  if (!title) errors.push("Başlık (title) eksik");

  const isbn = pickField(node, FIELD_ALIASES.isbn);
  const rawCover = pickField(node, FIELD_ALIASES.coverImage);
  let coverImage: string | null = null;
  if (rawCover) {
    if (isAllowedCoverImageUrl(rawCover)) {
      coverImage = rawCover;
    } else {
      warnings.push("Kapak görseli desteklenmeyen bir kaynaktan geldiği için atlandı (admin panelden yüklenebilir)");
    }
  }

  const priceRaw = pickField(node, FIELD_ALIASES.price);
  const price = toNumberOrNull(priceRaw);
  if (priceRaw && price === null) warnings.push(`Fiyat değeri okunamadı: "${priceRaw}"`);

  for (const { field, aliases } of UNSUPPORTED_FIELD_ALIASES) {
    if (pickField(node, aliases)) {
      warnings.push(`"${field}" alanı mevcut kitap veri modelinde desteklenmiyor, yok sayıldı`);
    }
  }

  const description = pickField(node, FIELD_ALIASES.description);
  const author = pickField(node, FIELD_ALIASES.author);
  const publisher = pickField(node, FIELD_ALIASES.publisher);
  const category = pickField(node, FIELD_ALIASES.category);
  const currency = pickField(node, FIELD_ALIASES.currency);

  const [sanitizedTitle, sanitizedAuthor, sanitizedPublisher, sanitizedDescription, sanitizedCategory] =
    await Promise.all([
      title ? sanitizePlainText(title) : Promise.resolve(null),
      author ? sanitizePlainText(author) : Promise.resolve(null),
      publisher ? sanitizePlainText(publisher) : Promise.resolve(null),
      description ? sanitizePlainText(description) : Promise.resolve(null),
      category ? sanitizePlainText(category) : Promise.resolve(null),
    ]);

  return {
    index,
    isbn,
    title: sanitizedTitle,
    author: sanitizedAuthor,
    publisher: sanitizedPublisher,
    description: sanitizedDescription,
    price,
    currency: currency ? currency.toUpperCase() : null,
    category: sanitizedCategory,
    coverImage,
    pageCount: toIntOrNull(pickField(node, FIELD_ALIASES.pageCount)),
    publishedYear: toIntOrNull(pickField(node, FIELD_ALIASES.publishedYear)),
    errors,
    warnings,
  };
}

// <books><book>...</book></books> yaygın kalıbı önceliklidir (kullanıcının
// verdiği örnekle birebir), ama tek kayıtlık dosyalarda fast-xml-parser
// tekrarlanan etiketi diziye değil tek objeye çevirir — ikisi de desteklenir.
// Kök altındaki çocuk etiket adı "book"/"kitap"/"item" değilse bile, kök
// altındaki İLK obje/dizi değerli alan kitap listesi olarak kabul edilir —
// böylece farklı isimlendirme kullanan XML'ler de varsayım yapılmadan okunur.
const BOOK_NODE_NAME_HINTS = ["book", "kitap", "item", "urun"];

export function parseBooksXml(
  xmlText: string,
): { books: Record<string, unknown>[] } | { error: string } {
  const validation = XMLValidator.validate(xmlText, { allowBooleanAttributes: true });
  if (validation !== true) {
    return { error: `Geçersiz XML: ${validation.err.msg} (satır ${validation.err.line})` };
  }

  const parser = new XMLParser({
    ignoreAttributes: true,
    ignoreDeclaration: true,
    trimValues: true,
    parseTagValue: false,
  });

  let parsed: unknown;
  try {
    parsed = parser.parse(xmlText);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "XML ayrıştırılamadı." };
  }

  if (typeof parsed !== "object" || parsed === null) {
    return { error: "XML içeriği beklenen yapıda değil." };
  }

  const rootKey = Object.keys(parsed as Record<string, unknown>)[0];
  const rootValue = rootKey ? (parsed as Record<string, unknown>)[rootKey] : null;
  if (typeof rootValue !== "object" || rootValue === null) {
    return { error: "XML içinde kitap listesi bulunamadı (bkz. <books><book>...</book></books>)." };
  }
  const rootObj = rootValue as Record<string, unknown>;

  const childKeys = Object.keys(rootObj);
  const hintedKey = childKeys.find((key) => BOOK_NODE_NAME_HINTS.includes(normalizeKey(key)));
  const bookKey =
    hintedKey ?? childKeys.find((key) => typeof rootObj[key] === "object" && rootObj[key] !== null);

  if (!bookKey) {
    return { error: "XML içinde kitap listesi bulunamadı (bkz. <books><book>...</book></books>)." };
  }

  const value = rootObj[bookKey];
  const books = Array.isArray(value)
    ? (value as Record<string, unknown>[])
    : [value as Record<string, unknown>];

  return { books: books.filter((book) => typeof book === "object" && book !== null) };
}

// Export tarafı: gerçek Product alanlarını yansıtır (kullanıcının verdiği
// örnek XML alan adlarına değil) — böylece dışa aktarılan dosya tekrar Import
// XML'e verildiğinde hiçbir bilgi kaybı olmadan aynı kitapları üretir
// (round-trip). price her zaman TRY'dir (bkz. lib/formatPrice.ts).
export interface ExportableProduct extends Product {
  author: { name: string } | null;
  category: { nameTr: string } | null;
}

export function buildBooksXml(products: ExportableProduct[]): string {
  const builder = new XMLBuilder({
    format: true,
    indentBy: "  ",
    ignoreAttributes: true,
    suppressEmptyNode: true,
  });

  const payload = {
    books: {
      book: products.map((product) => ({
        isbn: product.isbn ?? "",
        title: product.title,
        slug: product.slug,
        author: product.author?.name ?? "",
        publisher: product.publisher ?? "",
        description: product.description ?? "",
        price: product.price ?? "",
        currency: "TRY",
        category: product.category?.nameTr ?? "",
        coverImage: product.coverImage ?? "",
        pageCount: product.pageCount ?? "",
        publishedYear: product.publishedYear ?? "",
        status: product.status,
      })),
    },
  };

  return `<?xml version="1.0" encoding="UTF-8"?>\n${builder.build(payload)}`;
}
