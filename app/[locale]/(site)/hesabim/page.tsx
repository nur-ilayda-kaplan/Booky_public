import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { isLocale, type Locale } from "@/config/i18n.config";
import { getDictionary } from "@/lib/getDictionary";
import { buildMetadata } from "@/lib/buildMetadata";
import { localePath } from "@/lib/localePath";

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
    path: "/hesabim",
    title: dict.auth.myAccount,
    description: dict.auth.myAccount,
  });
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);

  const session = await auth();
  if (!session?.user) {
    redirect(`${localePath(locale, "/giris-yap")}?callbackUrl=${encodeURIComponent(localePath(locale, "/hesabim"))}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 font-serif text-3xl font-semibold">{dict.auth.myAccount}</h1>
      <div className="rounded-lg border border-black/5 bg-white p-5 text-base text-foreground/80">
        <p>
          <span className="font-medium">{dict.checkout.fullName}:</span> {session.user.name}
        </p>
        <p className="mt-2">
          <span className="font-medium">{dict.checkout.email}:</span> {session.user.email}
        </p>
      </div>
    </div>
  );
}
