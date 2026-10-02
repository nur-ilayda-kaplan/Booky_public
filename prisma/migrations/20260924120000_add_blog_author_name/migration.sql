-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "authorName" TEXT;

-- Mevcut yazılarda seçili yazarın adını yeni alana taşı.
UPDATE "BlogPost" AS b SET "authorName" = a."name" FROM "Author" AS a WHERE b."authorId" = a."id";
