import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/config/i18n.config";
import { getDictionary } from "@/lib/getDictionary";
import { buildMetadata } from "@/lib/buildMetadata";
import { localePath } from "@/lib/localePath";
import { formatDate } from "@/lib/formatDate";
import { eventSpeakerName } from "@/lib/eventSpeaker";
import { getEventGalleryById } from "@/lib/services/eventGalleries";
import { EventGalleryPhotos } from "@/components/event/EventGalleryPhotos";
import { PageContainer } from "@/components/layout/PageContainer";

// Etkinliğe bağlı olmayan "Kimler Geldi?" galerilerinin sayfası (bağlı
// olanların fotoğrafları etkinlik detay sayfasında gösterilir).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, id } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "tr";
  const dict = getDictionary(locale);
  const gallery = await getEventGalleryById(id);
  const name = gallery?.name || (gallery?.event ? eventSpeakerName(gallery.event, locale) : "");

  return buildMetadata({
    locale,
    path: `/kitabevi/kimler-geldi/${id}`,
    title: name ? `${name} | ${dict.guests.title}` : dict.guests.title,
    description: gallery?.note ?? dict.guests.intro,
    image: gallery?.images[0],
  });
}

export default async function GuestGalleryPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: rawLocale, id } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);

  const gallery = await getEventGalleryById(id);
  if (!gallery) notFound();

  const name = gallery.name || (gallery.event ? eventSpeakerName(gallery.event, locale) : "");
  const date = gallery.date ?? gallery.event?.date;

  return (
    <PageContainer className="py-12">
      <article className="max-w-3xl">
        <Link
          href={localePath(locale, "/kitabevi/kimler-geldi")}
          className="text-sm font-bold text-murdum hover:underline"
        >
          {`← ${dict.guests.title}`}
        </Link>
        <h1 className="mt-4 font-serif text-3xl font-semibold sm:text-4xl">{name}</h1>
        {date && <p className="mt-2 text-foreground/60">{formatDate(date, locale)}</p>}
        <EventGalleryPhotos gallery={{ ...gallery, note: undefined }} alt={name} />
        {gallery.note && (
          <p className="mt-8 whitespace-pre-line leading-relaxed text-foreground/80">{gallery.note}</p>
        )}
      </article>
    </PageContainer>
  );
}
