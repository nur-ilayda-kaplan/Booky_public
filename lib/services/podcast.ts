import { XMLParser } from "fast-xml-parser";
import { siteConfig } from "@/config/site.config";

export interface PodcastEpisode {
  // "#01" → "01"; başlıkta numara yoksa null.
  number: string | null;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
}

// YouTube kanal akışı API anahtarı gerektirmez; en son 15 videoyu döner.
// Ana sayfa saatte bir yeniden doğrular — yeni bölüm en geç bir saatte görünür.
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${siteConfig.podcast.youtubeChannelId}`;
const REVALIDATE_SECONDS = 60 * 60;
const DESCRIPTION_MAX_LENGTH = 220;

interface FeedEntry {
  title?: string;
  "yt:videoId"?: string;
  published?: string;
  "media:group"?: { "media:description"?: string };
}

// "Booky Podcast #01 | İrem Uzunhasanoğlu: Bibliyoterapi, …" →
// numara "01", başlık "İrem Uzunhasanoğlu: Bibliyoterapi, …"
function parseTitle(rawTitle: string): { number: string | null; title: string } {
  const number = rawTitle.match(/#\s*(\d+)/)?.[1] ?? null;
  const separatorIndex = rawTitle.indexOf("|");
  const title = separatorIndex >= 0 ? rawTitle.slice(separatorIndex + 1).trim() : rawTitle.trim();
  return { number, title };
}

// YouTube açıklamasının ilk paragrafı (bağlantı/zaman damgası listeleri
// genelde sonraki paragraflarda) — çok uzunsa kelime sınırında kesilir.
function firstParagraph(description: string): string {
  const paragraph = description.split(/\n\s*\n/)[0]?.replace(/\s+/g, " ").trim() ?? "";
  if (paragraph.length <= DESCRIPTION_MAX_LENGTH) return paragraph;
  return `${paragraph.slice(0, paragraph.lastIndexOf(" ", DESCRIPTION_MAX_LENGTH))}…`;
}

// Kanaldaki en son podcast bölümü (başlığında "podcast" geçen en yeni video).
// Akışa ulaşılamazsa ya da podcast videosu yoksa null — bölüm bu durumda
// sözlükteki sabit içerikle gösterilir.
export async function getLatestPodcastEpisode(): Promise<PodcastEpisode | null> {
  try {
    const response = await fetch(FEED_URL, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!response.ok) return null;

    const feed = new XMLParser({ ignoreAttributes: true }).parse(await response.text());
    const rawEntries: FeedEntry | FeedEntry[] | undefined = feed?.feed?.entry;
    const entries = Array.isArray(rawEntries) ? rawEntries : rawEntries ? [rawEntries] : [];

    const latest = entries
      .filter((entry) => entry.title && entry["yt:videoId"] && /podcast/i.test(entry.title))
      .sort((a, b) => (b.published ?? "").localeCompare(a.published ?? ""))[0];
    if (!latest) return null;

    const videoId = latest["yt:videoId"]!;
    const { number, title } = parseTitle(String(latest.title));
    return {
      number,
      title,
      description: firstParagraph(String(latest["media:group"]?.["media:description"] ?? "")),
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    };
  } catch {
    return null;
  }
}
