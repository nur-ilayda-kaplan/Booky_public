import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import type { Role } from "@prisma/client";
import { isAdminPanelRole } from "@/lib/adminGuard";
import "../globals.css";

export const metadata: Metadata = {
  title: "Yönetim Paneli",
  robots: { index: false, follow: false },
};

type NavLink = { href: string; label: string };

const ACCOUNT_LINK: NavLink = { href: "/admin/account", label: "Hesabım" };
const AUTHORS_LINK: NavLink = { href: "/admin/authors", label: "Yazarlar" };
const EVENTS_LINK: NavLink = { href: "/admin/events", label: "Etkinlikler" };

const ALL_MODULE_LINKS: NavLink[] = [
  { href: "/admin/settings", label: "Genel Ayarlar" },
  { href: "/admin/pages", label: "Sayfalar" },
  { href: "/admin/menus", label: "Menüler" },
  { href: "/admin/sliders", label: "Sliderlar" },
  { href: "/admin/products", label: "Kitaplar" },
  { href: "/admin/blog", label: "Blog" },
  AUTHORS_LINK,
  EVENTS_LINK,
  { href: "/admin/kimler-geldi", label: "Kimler Geldi?" },
  { href: "/admin/team", label: "Ekibimiz" },
  { href: "/admin/press", label: "Basında Booky" },
  { href: "/admin/users", label: "Kullanıcılar" },
  { href: "/admin/customers", label: "Müşteriler" },
  ACCOUNT_LINK,
];

// Panele girebilen her rol tüm modüllere erişir (bkz. lib/adminGuard.ts).
function getNavLinks(role: Role | undefined): NavLink[] {
  return isAdminPanelRole(role) ? ALL_MODULE_LINKS : [ACCOUNT_LINK];
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const navLinks = getNavLinks(session?.user?.role);

  return (
    <html lang="tr">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <header className="mb-6 flex items-center justify-between border-b border-black/5 pb-4">
            <h1 className="font-serif text-2xl font-semibold">Yönetim Paneli</h1>
            <Link href="/" className="text-sm font-medium text-brand-primary hover:underline">
              Siteye Dön
            </Link>
          </header>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <nav className="flex flex-wrap gap-2 lg:sticky lg:top-10 lg:w-56 lg:shrink-0 lg:flex-col lg:flex-nowrap">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md border border-black/10 px-3 py-1.5 text-sm font-medium hover:bg-black/[0.03] lg:w-full"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
