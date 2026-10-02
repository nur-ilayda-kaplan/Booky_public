import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  // Sadece `next dev` için: telefondan yerel ağ IP'siyle (192.168.x.x) ya da
  // HTTPS tüneliyle (cloudflared) açılan sayfanın JS dosyaları engellenmesin.
  allowedDevOrigins: ["192.168.*.*", "*.trycloudflare.com"],
  serverExternalPackages: ["@prisma/client", "prisma"],
  // Blog hikâye görseli fontları ve logoyu çalışma anında diskten okuyor;
  // Vercel paketine dahil edilmeleri için açıkça belirtiliyor.
  outputFileTracingIncludes: {
    "/api/blog/[slug]/story-image": ["./assets/fonts/**/*", "./public/images/logo/**/*"],
  },
  images: {
    // Admin panelden SVG logo/kapak görseli yüklenebildiği için next/image'in
    // dahili optimize edici route'unun SVG'yi reddetmemesi gerekiyor. Yüklenen
    // her SVG /api/admin/upload'ta zaten sanitize ediliyor; Next de burada
    // varsayılan olarak "script-src 'none'; sandbox;" CSP'siyle sunar.
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      // Ana sayfa podcast bölümünün YouTube kapak görselleri.
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
};

export default nextConfig;
