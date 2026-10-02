"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { NavLinkItem } from "./NavLinkItem";
import type { Locale } from "@/config/i18n.config";
import type { NavGroup } from "@/types/nav";

const HOVER_CLOSE_DELAY_MS = 180;

export function NavDropdown({
  group,
  locale,
  className = "",
}: {
  group: NavGroup;
  locale: Locale;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const supportsHover = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const handleMouseEnter = () => {
    if (!supportsHover()) return;
    clearCloseTimeout();
    setOpen(true);
  };

  // Buton ile portal'a taşınan panel, aralarında birkaç pikselik ortak
  // sınırla iki ayrı DOM alt ağacı — bu sınırda tarayıcının hangi elementin
  // "hover" olduğuna karar vermesi kararsız olabiliyor (aynı anda/art arda
  // mouseenter'lar, mouseleave hiç gelmeden). Bu yüzden kapatma kararını
  // salt "bu elementten çıktım" bilgisine değil, `relatedTarget`'ın (imlecin
  // GİRDİĞİ eleman) container/panel ikilisinin dışında olup olmadığına göre
  // veriyoruz — imleç birinden diğerine geçiyorsa zamanlayıcı hiç kurulmuyor.
  const handleMouseLeave = (event: React.MouseEvent) => {
    if (!supportsHover()) return;
    const nextTarget = event.relatedTarget as Node | null;
    if (
      nextTarget &&
      (containerRef.current?.contains(nextTarget) || panelRef.current?.contains(nextTarget))
    ) {
      return;
    }
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, HOVER_CLOSE_DELAY_MS);
  };

  useEffect(() => clearCloseTimeout, []);

  useEffect(() => {
    if (!open) return;

    const container = containerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      setPosition({ top: rect.bottom, left: rect.left });
    }

    function handleClick(event: MouseEvent) {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      clearCloseTimeout();
      setOpen(false);
    }
    // Header (bkz. HeaderScrollWrapper) `position: fixed` olduğu için nav
    // butonunun viewport'a göre konumu scroll ile hiç değişmez — bu yüzden
    // panel'i scroll'da kapatmaya gerek yok. Daha önce burada bir "scroll"
    // dinleyicisi vardı; sayfa scroll'landığı her an (trackpad momentum'unun
    // kullanıcı elini çektikten sonra ürettiği ardıl tikler dahil) menüyü
    // anında kapatıyordu — "hover'da açılıp hemen kapanıyor" hissinin asıl
    // nedeni buydu. Gerçek pencere `resize`'ında (header genişliği/düzeni
    // değişebileceği için) kapatmak hâlâ doğru.
    function handleResize() {
      clearCloseTimeout();
      setOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex items-center gap-[6px] whitespace-nowrap hover:text-murdum"
      >
        {group.label}
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open &&
        position &&
        createPortal(
          <div
            ref={panelRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="animate-dropdown fixed z-40 flex min-w-48 flex-col gap-1 rounded-md border border-black/5 bg-background p-2 pt-3 shadow-lg"
            style={{ top: position.top, left: position.left }}
          >
            {group.children.map((child) => (
              <NavLinkItem
                key={child.href}
                item={child}
                locale={locale}
                onClick={() => setOpen(false)}
                className="whitespace-nowrap rounded px-3 py-2 text-base font-medium hover:bg-brand-accent/40"
              />
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
