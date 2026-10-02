-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "authorSlug" TEXT;

-- CreateIndex
CREATE INDEX "BlogPost_authorSlug_idx" ON "BlogPost"("authorSlug");

-- Mevcut yazılar: lib/slugify.ts ile aynı kurallarla authorName'den anahtar üret.
UPDATE "BlogPost"
SET "authorSlug" = NULLIF(
  trim(both '-' from regexp_replace(
    regexp_replace(
      regexp_replace(
        lower(translate("authorName", 'çğıöşüÇĞİIÖŞÜ', 'cgiosucgiiosu')),
        '[^a-z0-9[:space:]-]', '', 'g'),
      '[[:space:]]+', '-', 'g'),
    '-+', '-', 'g')),
  '')
WHERE "authorName" IS NOT NULL;
