-- CreateTable
CREATE TABLE "EventGallery" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "images" TEXT[],
    "note" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventGallery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventGallery_eventId_key" ON "EventGallery"("eventId");

-- AddForeignKey
ALTER TABLE "EventGallery" ADD CONSTRAINT "EventGallery_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
