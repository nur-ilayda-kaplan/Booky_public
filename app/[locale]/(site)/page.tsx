import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/config/i18n.config";
import { getDictionary } from "@/lib/getDictionary";
import { localePath } from "@/lib/localePath";
import { istanbulMonthGenitive, istanbulMonthName } from "@/lib/formatDate";
import { getFeaturedProducts } from "@/lib/services/products";
import { getBlogPosts } from "@/lib/services/blog";
import { getUpcomingAndPastEvents } from "@/lib/services/events";
import { getEventGalleries } from "@/lib/services/eventGalleries";
import { getAuthors } from "@/lib/services/authors";
import { getHeroSlides } from "@/lib/services/sliders";
import { getLatestPodcastEpisode } from "@/lib/services/podcast";
import { siteConfig } from "@/config/site.config";
import {
  getSiteSettings,
  resolveAboutContent,
} from "@/lib/services/siteSettings";
import { HeroSlider } from "@/components/home/HeroSlider";
import {
  HomeSection,
  HomeSectionHeading,
  HomeSectionLink,
} from "@/components/home/HomeSection";
import { ShelfBook } from "@/components/home/ShelfBook";
import { HomeEventCard, MonthProgramCard } from "@/components/home/HomeEventCard";
import { PastEventGalleryList } from "@/components/event/PastEventGalleryList";
import { HomeBlogCard } from "@/components/home/HomeBlogCard";
import { GuestsCarousel } from "@/components/home/GuestsCarousel";
import { PodcastSection } from "@/components/home/PodcastSection";
import { InstagramSection } from "@/components/home/InstagramSection";
import { MobileEventsList } from "@/components/home/MobileEventsList";
import { EventsCalendar } from "@/components/event/EventsCalendar";

// Bölüm sırası ve ölçüleri Figma "Masaüstü, Ana Sayfa (1440)" (2:87)
// çerçevesinden: Hero → Öne Çıkan Kitaplar → Hakkımızda → Yaklaşan
// Etkinlikler → Booky Podcast → Son Blog Yazıları → Booky'de Kimler Var →
// Instagram.
const FEATURED_BOOK_COUNT = 7;
const HOME_EVENT_COUNT = 7;
// "Kimler Geldi?" bölümünde gösterilen en yakın geçmiş etkinlik galerisi sayısı.
const HOME_GALLERY_COUNT = 4;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);

  const [
    featuredProducts,
    latestPosts,
    eventsSplit,
    authorsList,
    heroSlides,
    siteSettings,
    podcastEpisode,
    eventGalleries,
  ] = await Promise.all([
    getFeaturedProducts(),
    getBlogPosts().then((posts) => posts.slice(0, 3)),
    getUpcomingAndPastEvents(),
    getAuthors(),
    getHeroSlides(locale, dict),
    getSiteSettings(),
    getLatestPodcastEpisode(),
    getEventGalleries(HOME_GALLERY_COUNT),
  ]);

  const about = resolveAboutContent(siteSettings, locale);
  const upcomingEvents = eventsSplit.upcoming.slice(0, HOME_EVENT_COUNT);
  const allEvents = [...eventsSplit.upcoming, ...eventsSplit.past];
  const monthName = istanbulMonthName(locale);
  const year = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" }).slice(0, 4);
  const eventsHref = localePath(locale, "/kitabevi/etkinlikler");
  const viewAll = dict.common.viewAll;

  return (
    // Footer'ın genel mt-16 boşluğu burada iptal edilir: Figma'da son bölüm
    // (Instagram) doğrudan altbilgiye bitişik.
    <div className="-mb-16">
      <HeroSlider
        slides={heroSlides}
        locale={locale}
        kicker={dict.home.heroKicker}
        secondaryCta={{
          href: "/kitabevi/etkinlikler",
          label: dict.home.heroMonthProgram.replace("{month}", monthName),
        }}
      />

      {/* Mobilde (Figma 2:470) Hakkımızda, Öne Çıkan Kitaplar'dan önce gelir. */}
      <div className="flex flex-col">
        {featuredProducts.length > 0 && (
          <HomeSection className="bg-white">
            <div className="sm:hidden">
              <HomeSectionHeading
                kicker={dict.home.featuredBooksSubtitle}
                title={dict.home.featuredBooks}
                action={<HomeSectionLink href={localePath(locale, "/bookstore")} label={viewAll} />}
              />
            </div>
            <div className="max-sm:hidden">
              <HomeSectionHeading
                kicker={dict.home.featuredBooksKicker.replace("{month}", monthName)}
                title={dict.home.featuredBooks}
                action={<HomeSectionLink href={localePath(locale, "/bookstore")} label={viewAll} />}
              />
            </div>
            {/* Figma "raf" (2:142): 7 kitap, justify-between (aralık 25px).
                Mobil (2:513): 16px aralıkla sağa taşan yatay kaydırma. */}
            <div className="no-scrollbar -mr-[20px] flex gap-[16px] overflow-x-auto pb-[20px] pr-[20px] sm:-mx-8 sm:gap-[25px] sm:px-8 lg:mx-0 lg:justify-between lg:gap-0 lg:overflow-visible lg:px-0">
              {featuredProducts.slice(0, FEATURED_BOOK_COUNT).map((product) => (
                <ShelfBook
                  key={product.id}
                  href={localePath(locale, `/bookstore/${product.slug}`)}
                  title={product.title}
                  coverImage={product.coverImage}
                  authorName={
                    authorsList.find(
                      (author) => author.slug === product.authorId || author.id === product.authorId,
                    )?.name
                  }
                />
              ))}
            </div>
          </HomeSection>
        )}

        {/* Figma "Hakkımızda" (2:150): metin sütunu ile 480×640 görsel arası 96px.
            Mobil (2:502): px-20 py-56, 20px aralıkla üst başlık, 350×420
            görsel, 26px giriş, 15px metin ve "Devamını Oku →" bağlantısı. */}
        <section className="bg-kagit px-[20px] py-[56px] max-sm:-order-1 sm:px-8 sm:py-[72px] lg:px-[120px] lg:py-[112px]">
          <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-[48px] lg:flex-row lg:gap-[96px]">
            <div className="flex min-w-0 flex-1 flex-col items-start gap-[20px] sm:gap-[24px]">
              <p className="text-[12px] font-extrabold uppercase leading-[1.255] tracking-[1.92px] text-murdum sm:text-[14px] sm:tracking-[2.52px]">
                {dict.about.title}
              </p>
              <div className="relative h-[420px] w-full overflow-hidden rounded-[8px] bg-brand-accent/40 sm:hidden">
                {siteSettings.aboutImageUrl && (
                  <Image
                    src={siteSettings.aboutImageUrl}
                    alt={dict.about.title}
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                )}
              </div>
              <h2 className="font-serif text-[26px] leading-[1.15] text-lacivert sm:text-[38px] sm:leading-[1.12]">
                {about.lead}
              </h2>
              <p className="text-[15px] font-semibold leading-[1.6] text-lacivert/80 sm:text-[18px]">
                {about.teaser}
              </p>
              <Link
                href={localePath(locale, "/kitabevi/hakkimizda")}
                className="whitespace-pre text-[15px] font-bold leading-[1.255] text-murdum sm:hidden"
              >
                {`${dict.common.readMore}  →`}
              </Link>
              <Link
                href={localePath(locale, "/kitabevi/hakkimizda")}
                className="rounded-full bg-murdum px-[28px] py-[16px] text-[15px] font-extrabold leading-[1.255] text-white transition hover:opacity-90 max-sm:hidden"
              >
                {dict.common.readMore}
              </Link>
            </div>
            <div className="relative aspect-[3/4] w-full max-w-[480px] shrink-0 overflow-hidden rounded-[8px] bg-brand-accent/40 max-sm:hidden lg:h-[640px] lg:w-[480px]">
              {siteSettings.aboutImageUrl && (
                <Image
                  src={siteSettings.aboutImageUrl}
                  alt={dict.about.title}
                  fill
                  sizes="(min-width: 1024px) 480px, 90vw"
                  className="object-cover"
                />
              )}
            </div>
          </div>
        </section>
      </div>

      <HomeSection className="bg-kagit">
        <HomeSectionHeading
          kicker={`${monthName} ${year}`}
          title={dict.home.upcomingEvents}
          action={<HomeSectionLink href={eventsHref} label={viewAll} className="max-sm:hidden" />}
        />
        <div className="sm:hidden">
          <MobileEventsList
            events={eventsSplit.upcoming}
            locale={locale}
            allEventsHref={eventsHref}
            allEventsLabel={dict.home.allEvents}
          />
        </div>
        <div className="rounded-[12px] border border-lacivert/8 bg-white p-4 max-sm:hidden sm:p-[32px]">
          <EventsCalendar events={allEvents} locale={locale} dict={dict} />
        </div>
        {/* Figma "etkinlik kartları" (2:266): 4 sütun, 24px yatay / 32px dikey aralık */}
        <div className="grid gap-x-[24px] gap-y-[32px] max-sm:hidden sm:grid-cols-2 lg:grid-cols-4">
          {upcomingEvents.map((event) => (
            <HomeEventCard key={event.id} event={event} locale={locale} />
          ))}
          <MonthProgramCard
            href={eventsHref}
            title={dict.home.monthProgramCardTitle.replace(
              "{month}",
              istanbulMonthGenitive(locale),
            )}
            ctaLabel={dict.home.monthProgramCardCta}
          />
        </div>
      </HomeSection>

      {eventGalleries.length > 0 && (
        <HomeSection className="bg-kagit">
          <HomeSectionHeading
            kicker={dict.home.pastEventsKicker}
            title={dict.home.whoVisited}
            action={
              <HomeSectionLink href={localePath(locale, "/kitabevi/kimler-geldi")} label={viewAll} />
            }
          />
          <PastEventGalleryList galleries={eventGalleries} locale={locale} dict={dict} gutter="home" />
        </HomeSection>
      )}

      <PodcastSection
        dict={dict}
        episode={podcastEpisode}
        youtubeFallbackUrl={siteConfig.podcast.youtubeChannelUrl}
        spotifyUrl={siteConfig.podcast.spotifyShowUrl}
      />

      {latestPosts.length > 0 && (
        // Figma "Son Blog Yazıları" (2:338): kâğıt zemin üstünde %22 opak doku.
        <HomeSection
          className="overflow-hidden bg-kagit"
          gapClassName="gap-[20px] sm:gap-[48px]"
          background={
            <Image
              src="/images/home/blog-background.jpg"
              alt=""
              fill
              sizes="100vw"
              className="object-cover opacity-[0.22]"
            />
          }
        >
          <HomeSectionHeading
            kicker={dict.home.latestPostsKicker}
            title={dict.home.latestPosts}
            action={<HomeSectionLink href={localePath(locale, "/kitabevi/blog")} label={viewAll} />}
          />
          <div className="grid gap-[32px] md:grid-cols-3">
            {/* Mobilde (Figma 2:579) yalnızca en son yazı */}
            {latestPosts.map((post, index) => (
              <div key={post.id} className={index > 0 ? "max-sm:hidden" : "contents"}>
                <HomeBlogCard post={post} locale={locale} />
              </div>
            ))}
          </div>
        </HomeSection>
      )}

      {authorsList.length > 0 && (
        <HomeSection className="bg-kagit">
          <HomeSectionHeading
            kicker={dict.home.guestsKicker}
            title={dict.home.ourAuthors}
            action={
              <HomeSectionLink href={localePath(locale, "/yayinevi/yazarlarimiz")} label={viewAll} />
            }
          />
          <GuestsCarousel authors={authorsList} locale={locale} dict={dict} />
        </HomeSection>
      )}

      <InstagramSection dict={dict} instagramUrl={siteSettings.socialInstagram} />
    </div>
  );
}
