import { prisma } from "@/lib/prisma";
import { products as staticProducts } from "@/data/products";
import type { Product } from "@/types";
import type { Product as PrismaProduct, Author, Category } from "@prisma/client";

type DbProduct = PrismaProduct & { author: Author | null; category: Category | null };

// Yazar/kategori id eşleşmesi: statik data/authors.ts ve data/categories.ts'te
// id === slug (bkz. prisma/seedCms.ts, upsert'ler slug üzerinden yapılıyor).
// Bu yüzden DB kaydının ilişkili yazar/kategori slug'ını authorId/categoryId
// alanına yazmak, statik id şemasıyla eşleşen sonuç üretir — getAuthorById /
// getCategoryById gibi statik id'ye göre arama yapan fonksiyonlar (Events
// sayfası dahil) değişmeden çalışmaya devam eder.
function mapDbProduct(product: DbProduct): Product {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    authorId: product.author?.slug ?? "",
    categoryId: product.category?.slug ?? "",
    price: product.price ?? 0,
    showPrice: product.showPrice,
    coverImage: product.coverImage ?? "",
    description: product.description ?? "",
    pageCount: product.pageCount ?? 0,
    publishedYear: product.publishedYear ?? 0,
    isbn: product.isbn ?? "",
    publisher: product.publisher ?? undefined,
    featured: product.featured,
    seoTitle: product.seoTitle ?? undefined,
    seoDescription: product.seoDescription ?? undefined,
    canonicalUrl: product.canonicalUrl ?? undefined,
    ogTitle: product.ogTitle ?? undefined,
    ogDescription: product.ogDescription ?? undefined,
    ogImage: product.ogImage ?? undefined,
    noIndex: product.noIndex,
  };
}

async function getDbProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: {
      OR: [{ status: "PUBLISHED" }, { status: "SCHEDULED", scheduledAt: { lte: new Date() } }],
    },
    include: { author: true, category: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapDbProduct);
}

// DB'de yayında ürün varsa onları kullan; hiç yoksa (henüz seed/panel
// içeriği girilmemişse) statik data/products.ts'e düş (SiteSetting/Slider
// cutover'larıyla aynı fallback deseni).
export async function getProducts(): Promise<Product[]> {
  const dbProducts = await getDbProducts();
  return dbProducts.length > 0 ? dbProducts : staticProducts;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((product) => product.slug === slug);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((product) => product.featured);
}

export async function getProductsByAuthor(authorId: string): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((product) => product.authorId === authorId);
}
