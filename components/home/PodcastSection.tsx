import Image from "next/image";
import type { Dictionary } from "@/lib/getDictionary";
import type { PodcastEpisode } from "@/lib/services/podcast";
import { HomeSection, HomeSectionHeading } from "./HomeSection";

// Figma "Booky Podcast" (2:320): lacivert zemin; 560×315 video kapağı
// (ortasında 96px fıstık oynat düğmesi), 56px aralıkla metin sütunu.
// Bölüm bilgisi YouTube kanalının akışından gelen en son bölümdür (bkz.
// lib/services/podcast.ts); akışa ulaşılamazsa sözlükteki sabit ilk bölüm
// ve yerel kapak görseli gösterilir.
export function PodcastSection({
  dict,
  episode,
  youtubeFallbackUrl,
  spotifyUrl,
}: {
  dict: Dictionary;
  episode: PodcastEpisode | null;
  youtubeFallbackUrl: string | null;
  spotifyUrl: string | null;
}) {
  const home = dict.home;
  const title = episode?.title ?? home.podcastEpisodeTitle;
  const description = episode?.description || home.podcastEpisodeDescription;
  const episodeLabel = home.podcastEpisodeLabel.replace("{number}", episode?.number ?? "01");
  const youtubeUrl = episode?.videoUrl ?? youtubeFallbackUrl;
  const cover = (
    <>
      <Image
        src={episode?.thumbnail ?? "/images/home/podcast-cover.jpg"}
        alt={title}
        fill
        sizes="(min-width: 1024px) 560px, 90vw"
        className="object-cover"
      />
      <Image
        src="/images/home/podcast-play.svg"
        alt=""
        width={96}
        height={96}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform group-hover:scale-105 max-sm:hidden"
      />
    </>
  );
  const coverClasses =
    "group relative aspect-[560/315] w-full shrink-0 overflow-hidden rounded-[8px] lg:w-[560px]";

  // Mobil (Figma 2:563): üst başlıkta bölüm numarası da yer alır, kapakta
  // oynat düğmesi yok, öğeler arası 24px, butonlar tam genişlikte alt alta.
  return (
    <HomeSection className="bg-lacivert">
      <div className="sm:hidden">
        <HomeSectionHeading
          tone="dark"
          kicker={`${home.podcastKicker}, ${episodeLabel}`}
          title={home.podcastTitle}
        />
      </div>
      <div className="max-sm:hidden">
        <HomeSectionHeading tone="dark" kicker={home.podcastKicker} title={home.podcastTitle} />
      </div>
      <div className="flex flex-col gap-[24px] sm:gap-[40px] lg:flex-row lg:items-center lg:gap-[56px]">
        {youtubeUrl ? (
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={home.podcastWatchOnYoutube}
            className={coverClasses}
          >
            {cover}
          </a>
        ) : (
          <div className={coverClasses}>{cover}</div>
        )}

        <div className="flex min-w-0 flex-1 flex-col items-start gap-[24px] sm:gap-[20px]">
          <p className="text-[14px] font-extrabold uppercase leading-[1.255] tracking-[2.52px] text-fistik max-sm:hidden">
            {episodeLabel}
          </p>
          <h3 className="font-serif text-[26px] leading-[1.4] text-white sm:text-[44px] sm:leading-[1.08]">
            {title}
          </h3>
          <p className="line-clamp-4 font-accent text-[16px] font-medium italic leading-[1.45] text-white/80 sm:line-clamp-3 sm:text-[20px]">
            {description}
          </p>
          {(youtubeUrl || spotifyUrl) && (
            <div className="flex w-full flex-col gap-[24px] sm:w-auto sm:flex-row sm:flex-wrap sm:gap-[12px]">
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-fistik px-[26px] py-[14px] text-center text-[15px] font-extrabold leading-[1.255] text-lacivert transition hover:opacity-90"
                >
                  {home.podcastWatchOnYoutube}
                </a>
              )}
              {spotifyUrl && (
                <a
                  href={spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border-[1.5px] border-white/50 px-[26px] py-[14px] text-center text-[15px] font-extrabold leading-[1.255] text-white transition hover:border-white"
                >
                  {home.podcastListenOnSpotify}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </HomeSection>
  );
}
