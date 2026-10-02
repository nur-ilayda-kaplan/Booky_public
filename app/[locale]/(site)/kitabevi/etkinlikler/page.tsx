import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/config/i18n.config";
import { getDictionary } from "@/lib/getDictionary";
import { buildMetadata } from "@/lib/buildMetadata";
import { getUpcomingAndPastEvents } from "@/lib/services/events";
import { EventCard } from "@/components/event/EventCard";
import { EventsCalendar } from "@/components/event/EventsCalendar";
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
    path: "/kitabevi/etkinlikler",
    title: dict.events.title,
    description: dict.home.upcomingEvents,
  });
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);

  const { upcoming: upcomingEvents, past: pastEvents } = await getUpcomingAndPastEvents();
  const events = [...upcomingEvents, ...pastEvents];

  return (
    <PageContainer className="py-12">
      <h1 className="mb-8 font-serif text-3xl font-semibold">{dict.events.title}</h1>

      {events.length === 0 ? (
        <p className="rounded-lg border border-black/5 bg-white p-8 text-center text-base text-foreground/60">
          {dict.common.noResults}
        </p>
      ) : (
        <>
          <div className="rounded-lg border border-black/5 bg-white p-4 sm:p-6">
            <EventsCalendar events={events} locale={locale} dict={dict} />
          </div>

          {upcomingEvents.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-6 font-serif text-2xl font-semibold">
                {dict.events.upcomingEvents}
              </h2>
              <div className="grid gap-6 lg:grid-cols-2">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} locale={locale} />
                ))}
              </div>
            </section>
          )}

          {pastEvents.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-6 font-serif text-2xl font-semibold">
                {dict.events.pastEvents}
              </h2>
              <div className="grid gap-6 lg:grid-cols-2">
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} locale={locale} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </PageContainer>
  );
}
