import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/config/i18n.config";
import { siteConfig } from "@/config/site.config";
import { getDictionary } from "@/lib/getDictionary";
import { buildWhatsappLink } from "@/lib/whatsapp";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { InstagramIcon } from "@/components/ui/icons/InstagramIcon";
import { WhatsappIcon } from "@/components/ui/icons/WhatsappIcon";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const activeLocale: Locale = isLocale(locale) ? locale : "tr";
  const dict = getDictionary(activeLocale);

  return {
    title: dict.comingSoon.title,
    robots: { index: false, follow: false },
  };
}

export default async function ComingSoonPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dict = getDictionary(locale);

  return (
    <main className="relative flex min-h-screen flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="absolute top-6 right-6">
        <LocaleSwitcher currentLocale={locale} />
      </div>

      <Image
        src={siteConfig.logo}
        alt={siteConfig.brandName}
        width={391}
        height={160}
        priority
        className="h-40 w-auto"
      />

      <h1 className="font-serif text-4xl text-brand-primary sm:text-5xl">
        {dict.comingSoon.title}
      </h1>

      <p className="max-w-lg text-lg text-foreground/70">
        {dict.comingSoon.message}
      </p>

      <div className="mt-4 flex items-center gap-4">
        <a
          href={siteConfig.social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-105"
        >
          <InstagramIcon size={36} />
        </a>
        <a
          href={buildWhatsappLink(siteConfig.social.whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-105"
        >
          <WhatsappIcon size={44} />
        </a>
      </div>
    </main>
  );
}
