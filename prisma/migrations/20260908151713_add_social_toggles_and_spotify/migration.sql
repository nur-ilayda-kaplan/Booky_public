-- AlterTable
ALTER TABLE "SiteSetting" ADD COLUMN     "socialFacebookEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "socialInstagramEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "socialLinkedinEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "socialSpotify" TEXT,
ADD COLUMN     "socialSpotifyEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "socialTiktokEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "socialXEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "socialYoutubeEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "whatsappEnabled" BOOLEAN NOT NULL DEFAULT true;
