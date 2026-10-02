"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Locale } from "@/config/i18n.config";
import { localePath } from "@/lib/localePath";

export interface HeroSlide {
  id: string;
  image: string;
  mobileImage?: string | null;
  imagePosition: string;
  title: string;
  subtitle: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
}

const SWIPE_THRESHOLD_PX = 40;

export function HeroSlider({
  slides,
  locale,
  kicker,
  secondaryCta,
}: {
  slides: HeroSlide[];
  locale: Locale;
  kicker: string;
  secondaryCta?: { href: string; label: string };
}) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 6000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length]);

  // Elle geçiş (nokta tıklama veya kaydırma) sonrası otomatik ilerleme
  // sayacını sıfırlar — yoksa kullanıcı kaydırdıktan hemen sonra slider
  // otomatik olarak bir sonrakine atlayabilir.
  function goToIndex(nextIndex: number) {
    setIndex(nextIndex);
    if (timerRef.current) clearInterval(timerRef.current);
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 6000);
  }

  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;
    if (deltaX < 0) {
      goToIndex((index + 1) % slides.length);
    } else {
      goToIndex((index - 1 + slides.length) % slides.length);
    }
  }

  if (slides.length === 0) return null;

  // Figma "Hero, slider 1/4" (2:107): 720px yükseklik; metin bloğu soldan
  // 120px'te dikey ortalı (28px aralık), noktalar left 120 / top 650.
  // Slider görselleri (BOOKY_Web Assets/04 Slider) kâğıt dokusu + çizimi tek
  // parçada taşır ve metin alanını boş bırakır: masaüstünde sol yarı
  // (1920×1080), mobilde üst kısım (390×735). Bu yüzden görsel tüm alanı
  // kaplar, metin üstüne gelir.
  // Mobil (Figma 2:477): px-20 pt-40 pb-56, 24px aralıkla üst başlık, 48px
  // başlık, alt başlık, tam genişlikte tek buton, noktalar ve 24px altta 400px
  // çizim alanı. Slaytlar aynı ızgara hücresinde üst üste durur; bölüm en
  // uzun slayt kadar uzar, görsel alta yaslanır.
  return (
    <section
      className="relative grid w-full touch-pan-y overflow-hidden bg-kagit sm:block sm:h-[720px]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map((slide, slideIndex) => (
        <div
          key={slide.id}
          aria-hidden={slideIndex !== index}
          className={`relative transition-opacity duration-700 [grid-area:1/1] sm:absolute sm:inset-0 ${
            slideIndex === index ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {slide.mobileImage && (
            <Image
              src={slide.mobileImage}
              alt=""
              fill
              priority={slideIndex === 0}
              // Dikey kutuyu yükseklikten dolduruyor (object-cover), görsel
              // ekran genişliğinin ~1.25 katı çiziliyor — 100vw yazılırsa
              // telefon gerekenden küçük dosya ister (bkz. IMAGE_SIZES.sliderMobile).
              sizes="125vw"
              className="object-cover object-bottom sm:hidden"
            />
          )}
          <Image
            src={slide.image}
            alt=""
            fill
            priority={slideIndex === 0}
            sizes="100vw"
            className={`object-cover ${slide.mobileImage ? "hidden sm:block" : ""}`}
            // Çizim görselin sağında; dar ekranlarda kırpılırken sağ taraf
            // korunur. Admin panelden özel bir konum seçildiyse o kullanılır.
            style={{
              objectPosition:
                slide.imagePosition && slide.imagePosition !== "center"
                  ? slide.imagePosition
                  : "right center",
            }}
          />

          <div className="relative mx-auto h-full max-w-[1440px]">
            <div className="relative z-10 flex flex-col items-start gap-[24px] px-[20px] pb-[480px] pt-[40px] sm:gap-[20px] sm:px-8 sm:pb-0 sm:pt-16 lg:absolute lg:left-[120px] lg:top-[calc(50%+0.5px)] lg:-translate-y-1/2 lg:gap-[28px] lg:p-0">
              <p className="text-[12px] font-extrabold uppercase leading-[1.255] tracking-[1.92px] text-murdum sm:text-[15px] sm:tracking-[2.7px]">
                {kicker}
              </p>
              <h1 className="max-w-[600px] text-balance font-serif text-[48px] leading-none tracking-[-1.44px] text-lacivert sm:text-[72px] sm:leading-[82px] lg:text-[96px] lg:leading-[110px] lg:tracking-[-2.88px]">
                {slide.title}
              </h1>
              {slide.subtitle && (
                <p className="max-w-[520px] font-accent text-[18px] font-medium italic leading-[1.45] text-lacivert/80 sm:text-[20px] sm:text-lacivert lg:text-[24px]">
                  {slide.subtitle}
                </p>
              )}
              <div className="flex w-full flex-wrap gap-[16px] sm:w-auto">
                {slide.ctaLabel && (
                  <a
                    href={localePath(locale, slide.ctaHref)}
                    className="w-full rounded-full bg-murdum py-[16px] text-center text-[16px] font-extrabold leading-[1.255] text-white transition hover:opacity-90 sm:w-auto sm:px-[32px] sm:py-[18px]"
                  >
                    {slide.ctaLabel}
                  </a>
                )}
                {secondaryCta && (
                  <a
                    href={localePath(locale, secondaryCta.href)}
                    className="rounded-full border-2 border-lacivert px-[32px] max-sm:hidden py-[18px] text-[16px] font-extrabold leading-[1.255] text-lacivert transition hover:bg-lacivert hover:text-white"
                  >
                    {secondaryCta.label}
                  </a>
                )}
              </div>
              {slides.length > 1 && (
                <div className="flex gap-[8px] sm:hidden">
                  {slides.map((dot, dotIndex) => (
                    <button
                      key={dot.id}
                      type="button"
                      aria-label={`Slide ${dotIndex + 1}`}
                      aria-current={dotIndex === index}
                      onClick={() => goToIndex(dotIndex)}
                      className={`h-[8px] rounded-[4px] transition-all ${
                        dotIndex === index ? "w-[24px] bg-murdum" : "w-[8px] bg-lacivert/20"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      <div className="pointer-events-none absolute inset-0 mx-auto max-w-[1440px] max-sm:hidden">
        {slides.length > 1 && (
          <div className="pointer-events-auto absolute bottom-[24px] z-10 flex gap-[10px] sm:left-8 lg:bottom-auto lg:left-[120px] lg:top-[650px]">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Slide ${slideIndex + 1}`}
                aria-current={slideIndex === index}
                onClick={() => goToIndex(slideIndex)}
                className={`h-[10px] rounded-[5px] transition-all ${
                  slideIndex === index ? "w-[32px] bg-murdum" : "w-[10px] bg-lacivert"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
