import { siteConfig } from "@/config/site.config";
import type { Product, Order, CartItem } from "@/types";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_ID = siteConfig.analytics.gaId;

export function initGA(): void {
  if (typeof window === "undefined" || !GA_ID || window.gtag) return;

  const dataLayer = window.dataLayer ?? [];
  window.dataLayer = dataLayer;
  window.gtag = function gtag(...args: unknown[]) {
    dataLayer.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID);

  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script.async = true;
  document.head.appendChild(script);
}

export function trackPageView(url: string): void {
  if (typeof window === "undefined" || !window.gtag || !GA_ID) return;
  window.gtag("config", GA_ID, { page_path: url });
}

export function trackEvent({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
  });
}

export function trackAddToCart(product: Product): void {
  trackEvent({
    action: "add_to_cart",
    category: "ecommerce",
    label: product.title,
    value: product.price,
  });
}

export function trackRemoveFromCart(product: Product): void {
  trackEvent({
    action: "remove_from_cart",
    category: "ecommerce",
    label: product.title,
    value: product.price,
  });
}

export function trackBeginCheckout(cart: CartItem[]): void {
  trackEvent({
    action: "begin_checkout",
    category: "ecommerce",
    value: cart.reduce((sum, item) => sum + item.quantity, 0),
  });
}

export function trackPurchase(order: Order): void {
  trackEvent({
    action: "purchase",
    category: "ecommerce",
    label: order.id,
    value: order.total,
  });
}

const TRAFFIC_SOURCE_STORAGE_KEY = "booky_traffic_source";

export function getTrafficSource(): string {
  if (typeof window === "undefined") return "direct";

  const existing = window.localStorage.getItem(TRAFFIC_SOURCE_STORAGE_KEY);
  if (existing) return existing;

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");
  const source = utmSource ?? (document.referrer ? new URL(document.referrer).hostname : "direct");

  window.localStorage.setItem(TRAFFIC_SOURCE_STORAGE_KEY, source);
  return source;
}
