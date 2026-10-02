import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProductAccess } from "@/lib/adminGuard";
import { slugify } from "@/lib/slugify";
import { MAX_XML_FILE_SIZE_BYTES, parseBooksXml, normalizeBookRow, type ParsedBookRow } from "@/lib/bookXml";

const ALLOWED_TYPES = ["text/xml", "application/xml", "text/plain"];

type RowAction = "create" | "update" | "created" | "updated" | "failed" | "invalid";

interface RowResult {
  index: number;
  title: string | null;
  isbn: string | null;
  action: RowAction;
  errors: string[];
  warnings: string[];
}

// Aynı ISBN'e birden fazla satır sahipse (kaynak XML'in kendi içinde), ilkini
// oluştur/güncelle, geri kalanını da aynı kayda uygula — ayrı ayrı kitap
// olarak çoğaltmaz.
function keyForIsbn(isbn: string | null): string | null {
  return isbn ? isbn.trim() : null;
}

async function resolveAuthorId(name: string | null): Promise<string | null> {
  if (!name) return null;
  const existing = await prisma.author.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
  if (existing) return existing.id;

  const slug = await generateUniqueSlug(name, "author");
  const created = await prisma.author.create({ data: { name, slug } });
  return created.id;
}

async function resolveCategoryId(name: string | null): Promise<string | null> {
  if (!name) return null;
  const existing = await prisma.category.findFirst({
    where: { nameTr: { equals: name, mode: "insensitive" } },
  });
  if (existing) return existing.id;

  const slug = await generateUniqueSlug(name, "category");
  const created = await prisma.category.create({ data: { nameTr: name, nameEn: name, slug } });
  return created.id;
}

// Product/Author/Category üçünün de unique bir slug alanı var — aynı üretim
// mantığı hepsinde tekrarlanmasın diye tek yerden, hedef modele göre çalışır.
async function generateUniqueSlug(base: string, target: "product" | "author" | "category"): Promise<string> {
  const root = slugify(base) || `${target}-${Date.now()}`;
  let candidate = root;

  for (let suffix = 2; ; suffix += 1) {
    const existing =
      target === "product"
        ? await prisma.product.findUnique({ where: { slug: candidate } })
        : target === "author"
          ? await prisma.author.findUnique({ where: { slug: candidate } })
          : await prisma.category.findUnique({ where: { slug: candidate } });
    if (!existing) return candidate;
    candidate = `${root}-${suffix}`;
  }
}

// Aynı USD Kuru admin panelde toplu fiyat kontrolü için de kullanılıyor
// (bkz. app/admin/products/ProductsListClient.tsx) — burada satır USD
// olarak işaretlenmişse tek para birimli (TRY) price alanına çevrilerek
// yazılır; mevcut Product modelinde ayrı bir currency alanı yok.
function resolveStoredPrice(row: ParsedBookRow, usdRate: number | null): number | null {
  if (row.price === null) return null;
  if (row.currency === "USD" && usdRate && usdRate > 0) {
    return Math.round(row.price * usdRate * 100) / 100;
  }
  return row.price;
}

export async function POST(request: Request) {
  const { response } = await requireProductAccess();
  if (response) return response;

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const commit = formData?.get("commit") === "true";
  const usdRateRaw = formData?.get("usdRate");
  const usdRate =
    typeof usdRateRaw === "string" && usdRateRaw.trim() !== "" ? Number.parseFloat(usdRateRaw) : null;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "NO_FILE" }, { status: 400 });
  }
  if (file.size > MAX_XML_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 413 });
  }
  if (file.type && !ALLOWED_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith(".xml")) {
    return NextResponse.json({ error: "UNSUPPORTED_TYPE" }, { status: 415 });
  }

  const xmlText = await file.text();
  const parsed = parseBooksXml(xmlText);
  if ("error" in parsed) {
    return NextResponse.json({ error: "INVALID_XML", message: parsed.error }, { status: 400 });
  }

  const rows = await Promise.all(parsed.books.map((node, index) => normalizeBookRow(node, index)));
  const total = rows.length;

  // Aynı ISBN'e sahip birden fazla ürün DB'de zaten var olabilir (Product.isbn
  // unique DEĞİL) — findFirst en eskisini/ilkini baz alır, bilinçli bir
  // basitleştirme (bkz. rapor).
  const isbnList = [...new Set(rows.map((row) => keyForIsbn(row.isbn)).filter((v): v is string => !!v))];
  const existingByIsbn = new Map<string, { id: string }>();
  if (isbnList.length > 0) {
    const existing = await prisma.product.findMany({
      where: { isbn: { in: isbnList } },
      select: { id: true, isbn: true },
    });
    for (const product of existing) {
      if (product.isbn) existingByIsbn.set(product.isbn, product);
    }
  }

  const results: RowResult[] = [];
  let created = 0;
  let updated = 0;
  let invalid = 0;
  let failed = 0;

  // Kaynak dosyanın kendi içinde tekrar eden ISBN'ler aynı çalıştırmada ikinci
  // kez "create" değil "update" olarak ele alınsın diye bu istekte
  // görülen/oluşturulan ISBN'ler izlenir (dry-run'da gerçek id yerine "true"
  // yer tutucusu, commit'te gerçek Product.id tutulur).
  const claimedInThisRequest = new Map<string, string | true>();

  for (const row of rows) {
    if (row.errors.length > 0) {
      invalid += 1;
      results.push({
        index: row.index,
        title: row.title,
        isbn: row.isbn,
        action: "invalid",
        errors: row.errors,
        warnings: row.warnings,
      });
      continue;
    }

    const isbnKey = keyForIsbn(row.isbn);
    const claimed = isbnKey ? claimedInThisRequest.get(isbnKey) : undefined;
    const existingId =
      (isbnKey && existingByIsbn.get(isbnKey)?.id) || (typeof claimed === "string" ? claimed : undefined);
    const willUpdate = Boolean(existingId) || claimed === true;

    if (!commit) {
      if (!willUpdate && isbnKey) claimedInThisRequest.set(isbnKey, true);
      results.push({
        index: row.index,
        title: row.title,
        isbn: row.isbn,
        action: willUpdate ? "update" : "create",
        errors: [],
        warnings: row.warnings,
      });
      continue;
    }

    try {
      const authorId = await resolveAuthorId(row.author);
      const categoryId = await resolveCategoryId(row.category);
      const price = resolveStoredPrice(row, usdRate);

      if (existingId) {
        await prisma.product.update({
          where: { id: existingId },
          data: {
            title: row.title as string,
            ...(row.publisher !== null && { publisher: row.publisher }),
            ...(row.description !== null && { description: row.description }),
            ...(row.coverImage !== null && { coverImage: row.coverImage }),
            ...(price !== null && { price }),
            ...(row.pageCount !== null && { pageCount: row.pageCount }),
            ...(row.publishedYear !== null && { publishedYear: row.publishedYear }),
            ...(authorId !== null && { authorId }),
            ...(categoryId !== null && { categoryId }),
          },
        });
        updated += 1;
        results.push({
          index: row.index,
          title: row.title,
          isbn: row.isbn,
          action: "updated",
          errors: [],
          warnings: row.warnings,
        });
      } else {
        const slug = await generateUniqueSlug(row.title as string, "product");
        const createdProduct = await prisma.product.create({
          data: {
            title: row.title as string,
            slug,
            isbn: row.isbn,
            publisher: row.publisher,
            description: row.description,
            coverImage: row.coverImage,
            price,
            pageCount: row.pageCount,
            publishedYear: row.publishedYear,
            authorId,
            categoryId,
            status: "DRAFT",
          },
        });
        if (isbnKey) claimedInThisRequest.set(isbnKey, createdProduct.id);
        created += 1;
        results.push({
          index: row.index,
          title: row.title,
          isbn: row.isbn,
          action: "created",
          errors: [],
          warnings: row.warnings,
        });
      }
    } catch (error) {
      failed += 1;
      results.push({
        index: row.index,
        title: row.title,
        isbn: row.isbn,
        action: "failed",
        errors: [error instanceof Error ? error.message : "Bilinmeyen hata"],
        warnings: row.warnings,
      });
    }
  }

  if (!commit) {
    const toCreate = results.filter((r) => r.action === "create").length;
    const toUpdate = results.filter((r) => r.action === "update").length;
    return NextResponse.json({
      committed: false,
      summary: { total, toCreate, toUpdate, invalid },
      rows: results,
    });
  }

  return NextResponse.json({
    committed: true,
    summary: { total, created, updated, invalid, failed },
    rows: results,
  });
}
