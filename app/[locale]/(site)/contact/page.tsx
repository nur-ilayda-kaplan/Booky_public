import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/config/i18n.config";
import { getDictionary } from "@/lib/getDictionary";
import { getSiteSettings } from "@/lib/services/siteSettings";
import { buildMapEmbedUrl } from "@/lib/mapEmbed";
import { toSpotifyEmbedUrl } from "@/lib/spotify";
import { buildMetadata } from "@/lib/buildMetadata";
import { ContactForm } from "@/components/forms/ContactForm";
import { InstagramIcon } from "@/components/ui/icons/InstagramIcon";
import { WhatsappIcon } from "@/components/ui/icons/WhatsappIcon";
import { PageContainer } from "@/components/layout/PageContainer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "tr";
  const dict = getDictionary(locale);
  const settings = await getSiteSettings();

  return buildMetadata({
    locale,
    path: "/contact",
    title: dict.contact.title,
    description: settings.address,
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);
  const settings = await getSiteSettings();

  return (
    <PageContainer className="py-12">
      <h1 className="mb-8 font-serif text-3xl font-semibold">
        {dict.contact.title}
      </h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <ContactForm dict={dict} locale={locale} />

        <div className="flex flex-col gap-6">
          <div className="rounded-lg border border-black/5 bg-white p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
              {dict.contact.address}
            </p>
            <p className="mt-1 text-base text-foreground/80">
              {settings.address}
            </p>

            <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-foreground/50">
              {dict.contact.phone}
            </p>
            <p className="mt-1 text-base text-foreground/80">
              {settings.phone}
            </p>

            <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-foreground/50">
              {dict.contact.email}
            </p>
            <p className="mt-1 text-base text-foreground/80">
              {settings.email}
            </p>

            {settings.workingHours && (
              <>
                <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-foreground/50">
                  {dict.contact.workingHours}
                </p>
                <p className="mt-1 text-base text-foreground/80">
                  {settings.workingHours}
                </p>
              </>
            )}
          </div>

          <div className="overflow-hidden rounded-lg border border-black/5">
            <iframe
              src={settings.mapEmbedUrl || buildMapEmbedUrl(settings.address)}
              title={settings.address}
              className="h-56 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {settings.socialSpotify && (
            <div className="overflow-hidden rounded-lg">
              <iframe
                src={toSpotifyEmbedUrl(settings.socialSpotify)}
                title="Spotify"
                width="100%"
                height="152"
                loading="lazy"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              />
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
