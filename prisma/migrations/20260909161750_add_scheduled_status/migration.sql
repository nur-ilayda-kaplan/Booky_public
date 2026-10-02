-- AlterEnum
ALTER TYPE "ContentStatus" ADD VALUE 'SCHEDULED';

-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "scheduledAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "scheduledAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "scheduledAt" TIMESTAMP(3);
