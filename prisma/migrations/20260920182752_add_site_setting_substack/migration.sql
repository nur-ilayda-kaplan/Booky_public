-- AlterTable
ALTER TABLE "SiteSetting" ADD COLUMN     "socialSubstack" TEXT,
ADD COLUMN     "socialSubstackEnabled" BOOLEAN NOT NULL DEFAULT false;
