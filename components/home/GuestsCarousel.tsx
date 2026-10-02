"use client";

import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { localePath } from "@/lib/localePath";
import type { Author } from "@/types";
import type { Locale } from "@/config/i18n.config";
import type { Dictionary } from "@/lib/getDictionary";

// Figma "Seri / Portre" halkası: Booky baykuşu renklerindeki 6 yay. Konum
// ve boyutlar Figma'daki 150×150 kutuya göre yüzde — portre 150px
// (masaüstü) ve 96px (mobil) boyutta aynı oranla çizilir. Fotoğraf %5
// içeride (150'de 7.5px).
const RING_ARCS: { src: string; style: CSSProperties }[] = [
  { src: "/images/home/portrait-ring-1.svg", style: { left: "50%", top: 0, width: "43.3%", height: "26.75%" } },
  { src: "/images/home/portrait-ring-2.svg", style: { left: "90.27%", top: "25%", width: "9.73%", height: "50%" } },
  { src: "/images/home/portrait-ring-3.svg", style: { left: "50%", top: "73.25%", width: "43.3%", height: "26.75%" } },
  { src: "/images/home/portrait-ring-4.svg", style: { left: "6.7%", top: "73.25%", width: "43.3%", height: "26.75%" } },
  { src: "/images/home/portrait-ring-5.svg", style: { left: 0, top: "25%", width: "9.73%", height: "50%" } },
  { src: "/images/home/portrait-ring-6.svg", style: { left: "6.7%", top: 0, width: "43.3%", height: "26.75%" } },
];

// Figma'da her sırada 6 konuk, iki sıra: 1072px'e 170px'lik 6 kart
// justify-between ile → sütun aralığı (1072 − 6×170) / 5 = 10.4px.
const ROW_SIZE = 6;
const MOBILE_GUEST_COUNT = 6;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toLocaleUpperCase("tr-TR"))
    .join("");
}

// Izgara sütun sütun dolar (grid-flow-col); Figma'daki gibi her 12'lik
// sayfada ilk 6 konuk üst sıraya, sonraki 6 alt sıraya düşsün diye sıralama
// sütun düzenine çevrilir.
function toColumnOrder<T>(items: T[]): T[] {
  const ordered: T[] = [];
  for (let pageStart = 0; pageStart < items.length; pageStart += ROW_SIZE * 2) {
    const top = items.slice(pageStart, pageStart + ROW_SIZE);
    const bottom = items.slice(pageStart + ROW_SIZE, pageStart + ROW_SIZE * 2);
    for (let column = 0; column < top.length; column += 1) {
      ordered.push(top[column]);
      if (bottom[column]) ordered.push(bottom[column]);
    }
  }
  return ordered;
}

function GuestPortrait({ author, size }: { author: Author; size: 96 | 150 }) {
  const sizeClass = size === 150 ? "size-[150px]" : "size-[96px]";

  if (!author.photo) {
    return (
      <div
        className={`flex ${sizeClass} items-center justify-center rounded-full border border-lacivert/10 bg-white`}
      >
        <span
          className={`font-serif leading-[1.4] text-murdum ${
            size === 150 ? "text-[40px]" : "text-[26px]"
          }`}
        >
          {initials(author.name)}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative ${sizeClass}`}>
      {RING_ARCS.map((arc) => (
        <div key={arc.src} className="absolute" style={arc.style}>
          <Image src={arc.src} alt="" fill sizes={`${size}px`} />
        </div>
      ))}
      <div className="absolute inset-[5%] overflow-hidden rounded-full bg-kagit">
        <Image
          src={author.photo}
          alt={author.name}
          fill
          sizes={`${Math.round(size * 0.9)}px`}
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
    </div>
  );
}

const ARROW_CLASSES =
  "hidden size-[44px] shrink-0 items-center justify-center rounded-full bg-white text-[18px] font-bold leading-[1.255] text-lacivert shadow-[0px_3px_10px_0px_rgba(0,0,0,0.1)] transition hover:scale-105 sm:flex";

export function GuestsCarousel({
  authors,
  locale,
  dict,
}: {
  authors: Author[];
  locale: Locale;
  dict: Dictionary;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "prev" | "next") {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollBy({
      left: direction === "next" ? container.clientWidth : -container.clientWidth,
      behavior: "smooth",
    });
  }

  if (authors.length === 0) return null;

  return (
    <>
      {/* Mobil (Figma 2:590): 3 sütun, 114px kart, 96px portre, ilk 6 konuk */}
      <div className="grid grid-cols-3 gap-x-[4px] gap-y-[24px] sm:hidden">
        {authors.slice(0, MOBILE_GUEST_COUNT).map((author) => (
          <Link
            key={author.id}
            href={localePath(locale, `/yayinevi/yazarlarimiz/${author.slug}`)}
            className="group flex flex-col items-center gap-[10px]"
          >
            <GuestPortrait author={author} size={96} />
            <p className="text-center font-serif text-[14px] leading-[1.18] text-lacivert">
              {author.name}
            </p>
          </Link>
        ))}
      </div>

      {/* Figma "karusel" (2:369): oklar 44px, oklar ile ızgara arası 20px. */}
      <div className="flex items-center gap-[20px] max-sm:hidden">
        <button
          type="button"
          onClick={() => scroll("prev")}
          aria-label={dict.common.previous}
          className={ARROW_CLASSES}
        >
          ‹
        </button>
        <div
          ref={scrollRef}
          className="no-scrollbar grid min-w-0 flex-1 auto-cols-[170px] grid-flow-col grid-rows-2 gap-x-[10.4px] gap-y-[40px] overflow-x-auto scroll-smooth snap-x snap-mandatory"
        >
          {toColumnOrder(authors).map((author) => (
            <Link
              key={author.id}
              href={localePath(locale, `/yayinevi/yazarlarimiz/${author.slug}`)}
              className="group flex w-[170px] snap-start flex-col items-center gap-[16px]"
            >
              <GuestPortrait author={author} size={150} />
              <p className="text-center font-serif text-[20px] leading-[1.4] text-lacivert group-hover:text-murdum">
                {author.name}
              </p>
            </Link>
          ))}
        </div>
        <button
          type="button"
          onClick={() => scroll("next")}
          aria-label={dict.common.next}
          className={ARROW_CLASSES}
        >
          ›
        </button>
      </div>
    </>
  );
}
