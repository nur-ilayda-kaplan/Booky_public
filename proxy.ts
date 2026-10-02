import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { defaultLocale, locales, type Locale } from "@/config/i18n.config";
import { localePath } from "@/lib/localePath";

const BYPASS_COOKIE = "coming_soon_bypass";
const BYPASS_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// Edge middleware'de çalıştığı için lib/adminGuard.ts (prisma, next/navigation
// kullanıyor) import edilemiyor — panel rolleri burada ayrıca tutuluyor.
// Modül bazlı kısıtlama (Blog/Ürün/sadece-SUPER_ADMIN) sayfa ve route
// seviyesindeki guard'larda yapılıyor; burası sadece "panele hiç girebilir mi"
// sorusuna bakıyor.
const ADMIN_PANEL_ROLES = [
  "SUPER_ADMIN",
  "BLOG_MANAGER",
  "BLOG_AUTHOR",
  "PRODUCT_MANAGER",
];

// Old nav restructure: these routes moved under /kitabevi and /yayinevi.
// Keep permanent redirects so bookmarked/indexed links don't break.
const LEGACY_REDIRECTS: { from: string; to: string }[] = [
  { from: "/about", to: "/kitabevi/hakkimizda" },
  { from: "/blog", to: "/kitabevi/blog" },
  { from: "/events", to: "/kitabevi/etkinlikler" },
  { from: "/authors", to: "/yayinevi/yazarlarimiz" },
  { from: "/publishing-house", to: "/yayinevi/biz-kimiz" },
];

function resolveLegacyRedirect(pathWithoutLocale: string): string | null {
  for (const { from, to } of LEGACY_REDIRECTS) {
    if (pathWithoutLocale === from) return to;
    if (pathWithoutLocale.startsWith(`${from}/`)) {
      return `${to}${pathWithoutLocale.slice(from.length)}`;
    }
  }
  return null;
}

function getPreferredLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && (locales as readonly string[]).includes(cookieLocale)) {
    return cookieLocale as Locale;
  }

  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage?.toLowerCase().startsWith("en")) {
    return "en";
  }

  return defaultLocale;
}

function withBypassCookie(response: NextResponse, secret: string) {
  response.cookies.set(BYPASS_COOKIE, secret, {
    maxAge: BYPASS_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return response;
}

async function guardAdminRoute(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const isApiAdminRoute = pathname.startsWith("/api/admin");

  // secureCookie belirtilmezse next-auth/jwt varsayılan olarak false kabul
  // edip önek'siz "authjs.session-token" adını arıyor — oysa Auth.js,
  // production'da (https) cookie'yi "__Secure-authjs.session-token" adıyla
  // yazıyor. Bu uyuşmazlık, production'da session var olsa bile middleware'in
  // onu hiç bulamamasına (ve /admin'e her girişte login'e atmasına) yol açar.
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  if (!token) {
    if (isApiAdminRoute) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    const loginUrl = new URL("/giris-yap", request.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!ADMIN_PANEL_ROLES.includes(token.role as string)) {
    if (isApiAdminRoute) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/", request.nextUrl.origin));
  }

  return NextResponse.next();
}

// Varsayılan dilin (tr) sayfalarını adres çubuğunda önek göstermeden
// [locale] route ağacına dahili olarak eşler — URL "/blog" kalır, Next.js
// arka planda "/tr/blog"u render eder.
function rewriteToDefaultLocale(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes live outside the [locale] tree and must stay reachable even in
  // coming-soon mode, so they're checked first and never enter the locale/coming-soon flow below.
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    return guardAdminRoute(request);
  }

  const matchedLocale = locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  ) as Locale | undefined;

  // /tr artık kanonik URL değil — sadece /blog gibi önek'siz haliyle
  // yaşıyor. Biri elle /tr veya /tr/... yazarsa (eski bağlantı, alışkanlık),
  // aynı içeriğin iki URL'de yaşamaması için önek'siz hale kalıcı yönlendiriyoruz.
  if (matchedLocale === defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(`/${defaultLocale}`.length) || "/";
    return NextResponse.redirect(url, 308);
  }

  const hasLocalePrefix = Boolean(matchedLocale);
  const locale: Locale = matchedLocale ?? getPreferredLocale(request);
  const pathWithoutLocale = hasLocalePrefix
    ? pathname.slice(`/${locale}`.length) || "/"
    : pathname;

  const comingSoonEnabled =
    process.env.NEXT_PUBLIC_COMING_SOON_MODE === "true";

  if (comingSoonEnabled) {
    const bypassSecret = process.env.COMING_SOON_BYPASS_SECRET;
    const previewParam = request.nextUrl.searchParams.get("preview");
    const hasFreshBypass =
      Boolean(bypassSecret) && previewParam === bypassSecret;
    const hasCookieBypass =
      Boolean(bypassSecret) &&
      request.cookies.get(BYPASS_COOKIE)?.value === bypassSecret;
    const isBypassed = hasFreshBypass || hasCookieBypass;

    const comingSoonPath = localePath(locale, "/coming-soon");
    const isComingSoonPath = pathname === comingSoonPath;

    // No valid bypass and not already on the coming-soon page: redirect there.
    if (!isBypassed && !isComingSoonPath) {
      const url = request.nextUrl.clone();
      url.pathname = comingSoonPath;
      url.search = "";
      return NextResponse.redirect(url);
    }

    // Bypassed (or already on /coming-soon): let it through — locale-prefixed
    // paths (/en/...) resolve directly, önek'siz (tr) paths rewrite internally.
    const response = hasLocalePrefix
      ? NextResponse.next()
      : rewriteToDefaultLocale(request, pathname);

    return hasFreshBypass ? withBypassCookie(response, bypassSecret!) : response;
  }

  const legacyTarget = resolveLegacyRedirect(pathWithoutLocale);
  if (legacyTarget) {
    const url = request.nextUrl.clone();
    url.pathname = localePath(locale, legacyTarget);
    return NextResponse.redirect(url, 308);
  }

  if (hasLocalePrefix) {
    return NextResponse.next();
  }

  // Önek yok: tarayıcı dili/çerez İngilizce'ye işaret ediyorsa gerçek /en
  // önekine görünür şekilde yönlendir; aksi halde (varsayılan tr) önek
  // göstermeden dahili olarak /tr'ye eşle.
  if (locale !== defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = localePath(locale, pathname);
    return NextResponse.redirect(url);
  }

  return rewriteToDefaultLocale(request, pathname);
}

export const config = {
  matcher: [
    "/((?!_next|api(?!/admin)|images|icons|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
