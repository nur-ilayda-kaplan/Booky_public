import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/config/i18n.config";
import { getDictionary } from "@/lib/getDictionary";
import { buildMetadata } from "@/lib/buildMetadata";
import { getTeam } from "@/lib/services/team";
import { TeamGrid } from "@/components/team/TeamGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PressBanner } from "@/components/ui/PressBanner";
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
    path: "/yayinevi/biz-kimiz",
    title: dict.publishingHouse.title,
    description: dict.team.intro,
  });
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);

  const teamList = await getTeam();

  return (
    <PageContainer className="py-12">
      <h1 className="font-serif text-3xl font-semibold sm:text-4xl">{dict.publishingHouse.title}</h1>
      <p className="mt-3 text-lg text-brand-primary">{dict.team.intro}</p>

      <section className="mt-12">
        <SectionHeading title={dict.team.title} />
        <TeamGrid members={teamList} closeLabel={dict.common.close} />
      </section>

      <PressBanner locale={locale} dict={dict} />
    </PageContainer>
  );
}
