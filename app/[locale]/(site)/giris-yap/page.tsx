import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/config/i18n.config";
import { getDictionary } from "@/lib/getDictionary";
import { buildMetadata } from "@/lib/buildMetadata";
import { localePath } from "@/lib/localePath";
import { sanitizeCallbackUrl } from "@/lib/safeCallbackUrl";
import { LoginForm } from "@/components/auth/LoginForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "tr";
  const dict = getDictionary(locale);

  return buildMetadata({ locale, path: "/giris-yap", title: dict.auth.login, description: dict.auth.login });
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);

  const { callbackUrl: rawCallbackUrl } = await searchParams;
  const callbackUrl = sanitizeCallbackUrl(rawCallbackUrl, localePath(locale, "/"));

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-center font-serif text-3xl font-semibold">{dict.auth.login}</h1>
      <LoginForm locale={locale} dict={dict} callbackUrl={callbackUrl} />
    </div>
  );
}
