import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/config/i18n.config";
import { getDictionary } from "@/lib/getDictionary";
import { CartClient } from "@/components/cart/CartClient";
import { PageContainer } from "@/components/layout/PageContainer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "tr";
  const dict = getDictionary(locale);

  return { title: dict.cart.title, robots: { index: false, follow: false } };
}

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);

  return (
    <PageContainer className="py-12">
      <h1 className="mb-8 font-serif text-3xl font-semibold">{dict.cart.title}</h1>
      <CartClient locale={locale} dict={dict} />
    </PageContainer>
  );
}
