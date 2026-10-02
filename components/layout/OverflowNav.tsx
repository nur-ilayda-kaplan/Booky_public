"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { NavDropdown } from "./NavDropdown";
import { NavLinkItem } from "./NavLinkItem";
import { isNavGroup } from "@/types/nav";
import { localePath } from "@/lib/localePath";
import type { NavEntry } from "@/types/nav";
import type { Locale } from "@/config/i18n.config";

// Figma "menü" (2:91) öğeleri arası boşluk — aşağıdaki gap-[24px] ile aynı.
const GAP_PX = 24;

export function OverflowNav({
  items,
  locale,
  moreLabel = "More",
  className = "",
}: {
  items: NavEntry[];
  locale: Locale;
  moreLabel?: string;
  className?: string;
}) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRefs = useRef<(HTMLElement | null)[]>([]);
  const moreRef = useRef<HTMLButtonElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [visibleCount, setVisibleCount] = useState(items.length);
  const [open, setOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<{
    top: number;
    right: number;
  } | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const recalculate = () => {
      const containerWidth = container.offsetWidth;
      const widths = measureRefs.current.map((el) => el?.offsetWidth ?? 0);
      const moreWidth = moreRef.current?.offsetWidth ?? 0;

      const totalWidth = widths.reduce(
        (sum, w, i) => sum + w + (i > 0 ? GAP_PX : 0),
        0,
      );
      if (totalWidth <= containerWidth) {
        setVisibleCount(items.length);
        return;
      }

      let widthSoFar = 0;
      let count = 0;
      for (let i = 0; i < widths.length; i++) {
        const increment = widths[i] + (i > 0 ? GAP_PX : 0);
        if (widthSoFar + increment + GAP_PX + moreWidth > containerWidth) break;
        widthSoFar += increment;
        count = i + 1;
      }
      setVisibleCount(count);
    };

    recalculate();
    const observer = new ResizeObserver(recalculate);
    observer.observe(container);
    return () => observer.disconnect();
  }, [items.length, locale]);

  useEffect(() => {
    if (!open) return;

    const button = moreButtonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      setPopoverPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }

    function handleClick(event: MouseEvent) {
      const target = event.target as Node;
      if (moreButtonRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
    }
    // Header `position: fixed` olduğu için "•••" butonunun viewport'a göre
    // konumu scroll ile değişmez (bkz. NavDropdown.tsx'teki aynı düzeltme) —
    // scroll'da kapatmak gereksiz ve en ufak scroll tikinde popover'ı
    // istemsizce kapatıyordu. Gerçek pencere resize'ında kapatmak (buton
    // pozisyonu/visibleCount değişebileceği için) hâlâ doğru.
    function handleResize() {
      setOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  const visibleItems = items.slice(0, visibleCount);
  const overflowItems = items.slice(visibleCount);

  return (
    <div
      ref={containerRef}
      className={`relative min-w-0 items-center gap-[24px] overflow-hidden ${className}`}
    >
      {visibleItems.map((item, index) =>
        isNavGroup(item) ? (
          <NavDropdown key={`group-${index}`} group={item} locale={locale} />
        ) : (
          <NavLinkItem
            key={item.href}
            item={item}
            locale={locale}
            // Figma'da aktif sayfa bağlantısı Mulish Bold + mürdüm.
            className={`whitespace-nowrap hover:text-murdum ${
              !item.external && pathname === localePath(locale, item.href)
                ? "font-bold text-murdum"
                : ""
            }`}
          />
        ),
      )}

      {overflowItems.length > 0 && (
        <button
          ref={moreButtonRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={moreLabel}
          aria-expanded={open}
          className="whitespace-nowrap hover:text-murdum"
        >
          •••
        </button>
      )}

      {open &&
        overflowItems.length > 0 &&
        popoverPosition &&
        createPortal(
          <div
            ref={popoverRef}
            className="fixed z-50 flex min-w-48 flex-col gap-1 rounded-md border border-black/5 bg-background p-2 shadow-lg"
            style={{ top: popoverPosition.top, right: popoverPosition.right }}
          >
            {overflowItems.map((item, index) =>
              isNavGroup(item) ? (
                <div key={`overflow-group-${index}`} className="flex flex-col">
                  <span className="px-3 pt-2 pb-1 text-sm font-semibold uppercase tracking-wide text-foreground/50">
                    {item.label}
                  </span>
                  {item.children.map((child) => (
                    <NavLinkItem
                      key={child.href}
                      item={child}
                      locale={locale}
                      onClick={() => setOpen(false)}
                      className="whitespace-nowrap rounded px-3 py-2 text-base font-medium hover:bg-brand-accent/40"
                    />
                  ))}
                </div>
              ) : (
                <NavLinkItem
                  key={item.href}
                  item={item}
                  locale={locale}
                  onClick={() => setOpen(false)}
                  className="whitespace-nowrap rounded px-3 py-2 text-base font-medium hover:bg-brand-accent/40"
                />
              ),
            )}
          </div>,
          document.body,
        )}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 flex items-center gap-4 opacity-0"
        style={{ visibility: "hidden" }}
      >
        {items.map((item, index) => (
          <span
            key={isNavGroup(item) ? `measure-group-${index}` : item.href}
            ref={(el) => {
              measureRefs.current[index] = el;
            }}
            className="flex items-center gap-1 whitespace-nowrap"
            tabIndex={-1}
          >
            {item.label}
            {isNavGroup(item) && <ChevronDown size={16} />}
          </span>
        ))}
        <button
          ref={moreRef}
          type="button"
          tabIndex={-1}
          className="whitespace-nowrap"
        >
          •••
        </button>
      </div>
    </div>
  );
}
