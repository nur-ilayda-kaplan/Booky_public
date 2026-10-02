import type { MetadataRoute } from "next";
import { locales } from "@/config/i18n.config";
import { siteConfig } from "@/config/site.config";
import { localePath } from "@/lib/localePath";
import { getProducts } from "@/lib/services/products";
import { getBlogPosts } from "@/lib/services/blog";
import { getPublishedPageSlugs } from "@/lib/services/pages";
import { getEvents } from "@/lib/services/events";
import { getAuthors } from "@/lib/services/authors";

const STATIC_PATHS = [
  "",
  "/bookstore",
  "/kitabevi/hakkimizda",
  "/kitabevi/blog",
  "/kitabevi/etkinlikler",
  "/kitabevi/kimler-geldi",
  "/yayinevi/biz-kimiz",
  "/yayinevi/yazarlarimiz",
  "/contact",
  "/press",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, blogPosts, pageSlugs, events, authors] = await Promise.all([
    getProducts(),
    getBlogPosts(),
    getPublishedPageSlugs(),
    getEvents(),
    getAuthors(),
  ]);

  const dynamicPaths = [
    ...products.map((product) => `/bookstore/${product.slug}`),
    ...blogPosts.map((post) => `/kitabevi/blog/${post.slug}`),
    ...pageSlugs.map((slug) => `/sayfa/${slug}`),
    ...events.map((event) => `/kitabevi/etkinlikler/${event.slug}`),
    ...authors.map((author) => `/yayinevi/yazarlarimiz/${author.slug}`),
  ];

  const paths = [...STATIC_PATHS, ...dynamicPaths];

  return locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${siteConfig.url}${localePath(locale, path || "/")}`,
      lastModified: new Date(),
    })),
  );
}
