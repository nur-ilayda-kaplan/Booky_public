-- AlterTable
ALTER TABLE "Slider" ADD COLUMN     "descriptionEn" TEXT,
ADD COLUMN     "descriptionTr" TEXT,
ADD COLUMN     "imagePosition" TEXT NOT NULL DEFAULT 'center';
