import { notFound } from "next/navigation";
import { isLocale } from "@/config/i18n.config";
import { getDictionary } from "@/lib/getDictionary";
import { getSiteSettings } from "@/lib/services/siteSettings";
import { getSocialLinks } from "@/lib/socialLinks";
import { CartProvider } from "@/hooks/useCart";
import { Header } from "@/components/layout/Header";
import { HeaderScrollWrapper } from "@/components/layout/HeaderScrollWrapper";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";
import { FloatingSocialButtons } from "@/components/layout/FloatingSocialButtons";

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dict = getDictionary(locale);
  const settings = await getSiteSettings();

  return (
    <CartProvider>
      <HeaderScrollWrapper>
        <Header locale={locale} dict={dict} settings={settings} />
      </HeaderScrollWrapper>
      <main className="flex-1">{children}</main>
      <Footer locale={locale} dict={dict} settings={settings} />
      <BackToTop />
      <FloatingSocialButtons
        links={getSocialLinks(settings)}
        label={dict.footer.followUs}
      />
    </CartProvider>
  );
}
