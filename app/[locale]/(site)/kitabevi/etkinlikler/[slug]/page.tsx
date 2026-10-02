import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/config/i18n.config";
import { siteConfig } from "@/config/site.config";
import { getDictionary } from "@/lib/getDictionary";
import { localePath } from "@/lib/localePath";
import { formatDate, formatDateTime } from "@/lib/formatDate";
import { buildWhatsappLink } from "@/lib/whatsapp";
import { buildMetadata } from "@/lib/buildMetadata";
import { getEventBySlug } from "@/lib/services/events";
import { getEventGalleryByEventId } from "@/lib/services/eventGalleries";
import { EventGalleryPhotos } from "@/components/event/EventGalleryPhotos";
import { getAuthorById } from "@/lib/services/authors";
import { PageContainer } from "@/components/layout/PageContainer";
import { eventTitle } from "@/lib/eventSpeaker";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "tr";
  const event = await getEventBySlug(slug);

  if (!event) {
    return buildMetadata({
      locale,
      path: `/kitabevi/etkinlikler/${slug}`,
      title: "Booky",
      description: "",
    });
  }

  return buildMetadata({
    locale,
    path: `/kitabevi/etkinlikler/${event.slug}`,
    title: event.seoTitle || eventTitle(event, locale),
    description: event.seoDescription || event.shortDescription,
    ogTitle: event.ogTitle,
    ogDescription: event.ogDescription,
    image: event.ogImage || event.coverImage,
    canonicalUrl: event.canonicalUrl,
    noIndex: event.noIndex,
  });
}

const infoColumnClasses: Record<number, string> = {
  1: "",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
};

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);

  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const gallery = await getEventGalleryByEventId(event.id);

  const eventAuthors = event.authorIds
    ? (
        await Promise.all(event.authorIds.map((id) => getAuthorById(id)))
      ).filter((author): author is NonNullable<typeof author> =>
        Boolean(author),
      )
    : [];

  // Tarih her zaman var; konum ve kontenjan opsiyonel.
  const infoColumnCount = 1 + (event.location ? 1 : 0) + (event.capacity !== undefined ? 1 : 0);

  const whatsappMessage =
    locale === "tr"
      ? `Merhaba, "${eventTitle(event, locale)}" etkinliği hakkında bilgi almak istiyorum.`
      : `Hi, I'd like more information about the "${eventTitle(event, locale)}" event.`;

  return (
    <PageContainer className="py-12">
      <article className="max-w-3xl">
        {/* 4:5 dikey kapak (bkz. IMAGE_SIZES.eventCover); tam genişlikte çok
            uzun olmasın diye en fazla 480px genişlik. */}
        <div className="relative aspect-[4/5] w-full max-w-[480px] overflow-hidden rounded-[16px] bg-brand-accent/20">
          {event.coverImage && (
            <Image
              src={event.coverImage}
              alt={eventTitle(event, locale)}
              fill
              sizes="(min-width: 640px) 480px, 100vw"
              className="object-cover"
              priority
            />
          )}
        </div>

        <h1 className="mt-8 font-serif text-3xl font-semibold sm:text-4xl">
          {eventTitle(event, locale)}
        </h1>

        <div
          className={`mt-6 grid gap-4 rounded-lg border border-black/5 bg-brand-accent/10 p-5 ${
            infoColumnClasses[infoColumnCount]
          }`}
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
              {dict.events.dateLabel}
            </p>
            <p className="mt-1 font-medium">
              {event.hasTime === false ? formatDate(event.date, locale) : formatDateTime(event.date, locale)}
            </p>
          </div>
          {event.location && (
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
                {dict.events.locationLabel}
              </p>
              <p className="mt-1 font-medium">{event.location}</p>
            </div>
          )}
          {event.capacity !== undefined && (
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
                {dict.events.capacityLabel}
              </p>
              <p className="mt-1 font-medium">
                {event.capacity === 0 ? dict.events.capacityFull : event.capacity}
              </p>
            </div>
          )}
        </div>

        {event.description && (
          <p className="mt-8 leading-relaxed whitespace-pre-line text-foreground/80">
            {event.description}
          </p>
        )}

        {gallery && (
          <EventGalleryPhotos
            gallery={gallery}
            title={dict.events.galleryTitle}
            alt={eventTitle(event, locale)}
          />
        )}

        {eventAuthors.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            {eventAuthors.map((author) => (
              <Link
                key={author.id}
                href={localePath(
                  locale,
                  `/yayinevi/yazarlarimiz/${author.slug}`,
                )}
                className="flex items-center gap-2 rounded-full border border-black/10 py-1 pr-4 pl-1 text-base hover:border-brand-primary"
              >
                <span className="relative h-8 w-8 overflow-hidden rounded-full bg-brand-accent/30">
                  {author.photo && (
                    <Image
                      src={author.photo}
                      alt={author.name}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  )}
                </span>
                {author.name}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a
            href={buildWhatsappLink(
              siteConfig.social.whatsapp,
              whatsappMessage,
            )}
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-brand-primary px-6 py-3 text-center text-base font-semibold text-white transition hover:opacity-90"
          >
            {dict.events.join}
          </a>
          <Link
            href={localePath(locale, "/contact")}
            className="rounded-md border border-brand-primary px-6 py-3 text-center text-base font-semibold text-brand-primary transition hover:bg-brand-primary hover:text-white"
          >
            {dict.nav.contact}
          </Link>
        </div>
      </article>
    </PageContainer>
  );
}
