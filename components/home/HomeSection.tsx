import Link from "next/link";
import type { ReactNode } from "react";

// Figma ana sayfa bölümlerinin ortak iskeleti: 1440 genişlikte px-120 py-112,
// başlık ile içerik arası 48px. 1440'tan geniş ekranlarda içerik 1200px'te
// ortalanır. Mobil (Figma 2:470, 390): px-20 py-56, başlık↔içerik 24px.
export function HomeSection({
  className = "",
  gapClassName = "gap-[24px] sm:gap-[48px]",
  background,
  children,
}: {
  className?: string;
  // Başlık ile içerik arası; mobil blog bölümünde Figma'da 20px.
  gapClassName?: string;
  // Bölümün tamamını kaplayan dekoratif katman (ör. blog dokusu).
  background?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      className={`relative px-[20px] py-[56px] sm:px-8 sm:py-[72px] lg:px-[120px] lg:py-[112px] ${className}`}
    >
      {background}
      <div className={`relative mx-auto flex max-w-[1200px] flex-col ${gapClassName}`}>
        {children}
      </div>
    </section>
  );
}

// Figma "başlık" (ör. 2:137): Mulish ExtraBold 14px / 2.52px harf aralıklı
// üst başlık + 12px boşluk + Young Serif 52px / -1.04px başlık; sağda
// alt kenara hizalı bağlantı. Mobilde: 12px üst başlık, 8px aralık, 32px
// başlık (satır yüksekliği 1.08) ve bağlantı başlığın altında.
export function HomeSectionHeading({
  kicker,
  title,
  action,
  tone = "light",
  uppercaseKicker = true,
}: {
  kicker: string;
  title: string;
  action?: ReactNode;
  tone?: "light" | "dark";
  uppercaseKicker?: boolean;
}) {
  return (
    <div className="flex flex-col items-start gap-[8px] sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-x-6 sm:gap-y-4">
      <div className="flex min-w-0 flex-col gap-[8px] sm:gap-[12px]">
        <p
          className={`text-[12px] font-extrabold leading-[1.255] tracking-[1.92px] sm:text-[14px] sm:tracking-[2.52px] ${
            tone === "dark" ? "text-fistik" : "text-murdum"
          } ${uppercaseKicker ? "uppercase" : ""}`}
        >
          {kicker}
        </p>
        <h2
          className={`font-serif text-[32px] leading-[1.08] sm:text-[52px] sm:leading-[1.4] sm:tracking-[-1.04px] ${
            tone === "dark" ? "text-white" : "text-lacivert"
          }`}
        >
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

// "Tümünü Gör  →" — Mulish Bold 16px mürdüm; metin ile ok arasındaki çift
// boşluk Figma'daki gibi korunur.
export function HomeSectionLink({
  href,
  label,
  external = false,
  className: extraClassName = "",
}: {
  href: string;
  label: string;
  external?: boolean;
  className?: string;
}) {
  const className = `whitespace-pre text-[14px] font-bold leading-[1.255] text-murdum hover:underline sm:text-[16px] ${extraClassName}`;
  const content = `${label}  →`;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
