-- DropForeignKey
ALTER TABLE "EventGallery" DROP CONSTRAINT "EventGallery_eventId_fkey";

-- AlterTable
ALTER TABLE "EventGallery" ADD COLUMN     "date" TIMESTAMP(3),
ADD COLUMN     "name" TEXT,
ALTER COLUMN "eventId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "EventGallery" ADD CONSTRAINT "EventGallery_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
