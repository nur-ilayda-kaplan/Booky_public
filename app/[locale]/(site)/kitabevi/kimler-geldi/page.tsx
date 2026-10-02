import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/config/i18n.config";
import { getDictionary } from "@/lib/getDictionary";
import { buildMetadata } from "@/lib/buildMetadata";
import { getGuests } from "@/lib/services/guests";
import { getEventGalleries } from "@/lib/services/eventGalleries";
import { PastEventGalleryList } from "@/components/event/PastEventGalleryList";
import { GuestCard } from "@/components/guest/GuestCard";
import { PageContainer } from "@/components/layout/PageContainer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "tr";
  const dict = getDictionary(locale);

  return buildMetadata({
    locale,
    path: "/kitabevi/kimler-geldi",
    title: dict.guests.title,
    description: dict.guests.intro,
  });
}

export default async function GuestsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);

  // Admin'de /admin/kimler-geldi altından eklenen geçmiş etkinlik
  // galerileri; statik konuk listesi (data/guests.ts) doluysa altında kalır.
  const [galleries, guestsList] = await Promise.all([getEventGalleries(), getGuests()]);

  return (
    <PageContainer className="py-12">
      <h1 className="font-serif text-3xl font-semibold sm:text-4xl">{dict.guests.title}</h1>
      <p className="mt-3 text-lg text-brand-primary">{dict.guests.intro}</p>

      {galleries.length > 0 && (
        <div className="mt-10">
          <PastEventGalleryList galleries={galleries} locale={locale} dict={dict} gutter="page" layout="grid" />
        </div>
      )}

      {guestsList.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {guestsList.map((guest) => (
            <GuestCard key={guest.id} guest={guest} dict={dict} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
