-- El ile yazıldı (Prisma'nın otomatik diff'i, ADMIN/EDITOR değerlerini
-- kaldırıp yeni değerler eklediğini düşünüp veri kaybına yol açacak bir
-- migration üretiyordu). Bu adım sadece EKLEYİCİ ve GÜVENLİDİR:
--   - Role enum değerleri RENAME VALUE ile yeniden adlandırılıyor
--     (var olan User.role satırları OID üzerinden korunur, hiçbir satır
--     güncellenmez/kaybolmaz).
--   - BlogPost.category (string) alanı bu migration'da SİLİNMİYOR;
--     categoryId/createdByUserId nullable olarak ekleniyor. category
--     alanı, veri backfill script'i (prisma/backfill-blog-categories.ts)
--     çalışıp doğrulandıktan sonra ayrı bir migration'da kaldırılacak.

-- Rol adlarını yeniden adlandır: ADMIN -> SUPER_ADMIN, EDITOR -> BLOG_MANAGER.
-- Mevcut kullanıcı satırları etkilenmez, sadece değerin adı değişir.
ALTER TYPE "Role" RENAME VALUE 'ADMIN' TO 'SUPER_ADMIN';
ALTER TYPE "Role" RENAME VALUE 'EDITOR' TO 'BLOG_MANAGER';

-- Yeni roller
ALTER TYPE "Role" ADD VALUE 'BLOG_AUTHOR';
ALTER TYPE "Role" ADD VALUE 'PRODUCT_MANAGER';

-- BlogPost: kategori artık Category modeliyle ilişkisel (Product'takiyle
-- aynı model paylaşılıyor). Eski "category" string alanı şimdilik duruyor.
ALTER TABLE "BlogPost" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "BlogPost" ADD COLUMN "createdByUserId" TEXT;

ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- BLOG_AUTHOR'ın yazabildiği kategoriler
CREATE TABLE "UserCategoryAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCategoryAccess_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserCategoryAccess_userId_categoryId_key" ON "UserCategoryAccess"("userId", "categoryId");

ALTER TABLE "UserCategoryAccess" ADD CONSTRAINT "UserCategoryAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserCategoryAccess" ADD CONSTRAINT "UserCategoryAccess_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
