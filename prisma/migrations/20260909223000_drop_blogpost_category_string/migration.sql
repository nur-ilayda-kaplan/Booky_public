-- prisma/backfill-blog-categories.ts başarıyla çalıştırılıp doğrulandıktan
-- sonra (7 satırın 7'si de eski category string'i ile yeni categoryId
-- ilişkisi eşleşti) eski serbest-metin category sütunu artık gereksiz.
ALTER TABLE "BlogPost" DROP COLUMN "category";
