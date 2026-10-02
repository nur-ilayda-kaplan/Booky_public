import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { isLocale, type Locale } from "@/config/i18n.config";
import { getDictionary } from "@/lib/getDictionary";
import { CheckoutClient } from "@/components/cart/CheckoutClient";
import { PageContainer } from "@/components/layout/PageContainer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "tr";
  const dict = getDictionary(locale);

  return { title: dict.checkout.title, robots: { index: false, follow: false } };
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);

  const session = await auth();
  const user = session?.user
    ? { name: session.user.name ?? "", email: session.user.email ?? "" }
    : null;

  return (
    <PageContainer className="py-12">
      <h1 className="mb-8 font-serif text-3xl font-semibold">{dict.checkout.title}</h1>
      <CheckoutClient locale={locale} dict={dict} user={user} />
    </PageContainer>
  );
}
