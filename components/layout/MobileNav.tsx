"use client";

import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { SearchOverlay } from "./SearchOverlay";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { NavLinkItem } from "./NavLinkItem";
import { isNavGroup } from "@/types/nav";
import type { NavEntry, NavGroup } from "@/types/nav";
import type { Locale } from "@/config/i18n.config";
import type { Dictionary } from "@/lib/getDictionary";

function MobileNavGroup({
  group,
  locale,
  isOpen,
  onToggle,
  onNavigate,
}: {
  group: NavGroup;
  locale: Locale;
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex items-center justify-between rounded-md px-3 py-2.5 text-base font-medium hover:bg-brand-accent/40 active:bg-brand-accent/20"
      >
        {group.label}
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="ml-3 flex min-h-0 flex-col border-l border-black/10 pl-3">
          {group.children.map((child) => (
            <NavLinkItem
              key={child.href}
              item={child}
              locale={locale}
              onClick={onNavigate}
              className="rounded-md px-3 py-2 text-base text-foreground/80 hover:bg-brand-accent/40 active:bg-brand-accent/20"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function MobileNav({
  locale,
  items,
  dict,
  menuLabel,
  closeLabel,
  accountSlot,
}: {
  locale: Locale;
  items: NavEntry[];
  dict: Dictionary;
  menuLabel: string;
  closeLabel: string;
  // Mobil header'da yer almayan hesap bağlantısı (giriş / hesabım) çekmecede.
  accountSlot?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <div className="sm:hidden">
      {/* Figma "menü ikonu" (2:473): 24px genişlikte, 2.5px kalınlıkta üç
          çizgi, 6px aralık. -m-2 p-2: dokunma alanı büyür, konum değişmez. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={menuLabel}
        className="-m-2 flex flex-col gap-[6px] p-2"
      >
        <span className="h-[2.5px] w-[24px] rounded-[2px] bg-lacivert" />
        <span className="h-[2.5px] w-[24px] rounded-[2px] bg-lacivert" />
        <span className="h-[2.5px] w-[24px] rounded-[2px] bg-lacivert" />
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-black/40"
            onClick={() => setOpen(false)}
          >
            <nav
              className="ml-auto flex h-full w-72 max-w-[80%] translate-x-0 flex-col gap-1 overflow-y-auto bg-background p-6 shadow-xl transition-transform duration-300 ease-out animate-in slide-in-from-right"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={closeLabel}
                className="mb-4 self-end p-2"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
              <div className="mb-4">
                <SearchOverlay
                  locale={locale}
                  dict={dict}
                  variant="row"
                  onResultNavigate={() => setOpen(false)}
                />
              </div>
              {items
                .filter((item) => item.showOnMobile !== false)
                .map((item, index) => {
                  const sectionId = `group-${index}`;
                  return isNavGroup(item) ? (
                    <MobileNavGroup
                      key={sectionId}
                      group={item}
                      locale={locale}
                      isOpen={openSection === sectionId}
                      onToggle={() =>
                        setOpenSection((current) =>
                          current === sectionId ? null : sectionId,
                        )
                      }
                      onNavigate={() => setOpen(false)}
                    />
                  ) : (
                    <NavLinkItem
                      key={item.href}
                      item={item}
                      locale={locale}
                      onClick={() => setOpen(false)}
                      className="rounded-md px-3 py-2.5 text-base font-medium hover:bg-brand-accent/40 active:bg-brand-accent/20"
                    />
                  );
                })}
              <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4">
                <LocaleSwitcher currentLocale={locale} />
                {accountSlot}
              </div>
            </nav>
          </div>,
          document.body,
        )}
    </div>
  );
}
