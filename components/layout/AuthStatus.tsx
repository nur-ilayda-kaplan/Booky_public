"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import type { Role } from "@prisma/client";
import { localePath } from "@/lib/localePath";

// lib/adminGuard.ts sunucu-özel modüller (auth, prisma) import ettiği için
// client component'te kullanılamıyor — panel rolleri burada ayrıca tutuluyor.
const ADMIN_PANEL_ROLES: Role[] = ["SUPER_ADMIN", "BLOG_MANAGER", "BLOG_AUTHOR", "PRODUCT_MANAGER"];
import type { Locale } from "@/config/i18n.config";
import type { Dictionary } from "@/lib/getDictionary";

// Figma "buton, giriş" (2:104): 1.5px lacivert/25 çerçeveli hap, px-22 py-10,
// ikon↔metin 8px, Mulish Bold 14px. Mobilde yalnızca ikon görünür.
const PILL_CLASSES =
  "flex items-center gap-[8px] rounded-full border-[1.5px] border-lacivert/25 px-[12px] py-[10px] text-[14px] font-bold leading-[1.255] text-lacivert transition-colors hover:border-murdum hover:text-murdum sm:px-[22px]";

function PersonIcon() {
  return (
    <Image
      src="/images/icons/icon-person.svg"
      alt=""
      width={12}
      height={12}
      className="shrink-0"
    />
  );
}

export function AuthStatus({
  user,
  locale,
  dict,
}: {
  user: { name: string; email: string; role: Role } | null;
  locale: Locale;
  dict: Dictionary;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    if (!open) return;

    const button = buttonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      setPosition({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }

    function handleClick(event: MouseEvent) {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
    }
    function handleDismiss() {
      setOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    window.addEventListener("scroll", handleDismiss, true);
    window.addEventListener("resize", handleDismiss);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", handleDismiss, true);
      window.removeEventListener("resize", handleDismiss);
    };
  }, [open]);

  if (!user) {
    return (
      <Link
        href={localePath(locale, "/giris-yap")}
        aria-label={dict.auth.login}
        className={PILL_CLASSES}
      >
        <PersonIcon />
        <span className="hidden sm:inline">{dict.auth.login}</span>
      </Link>
    );
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={dict.auth.myAccount}
        className={PILL_CLASSES}
      >
        <PersonIcon />
        <span className="hidden max-w-40 truncate sm:inline">{user.name}</span>
      </button>

      {open &&
        position &&
        createPortal(
          <div
            ref={popoverRef}
            className="fixed z-50 flex min-w-44 flex-col gap-1 rounded-md border border-black/5 bg-background p-2 shadow-lg"
            style={{ top: position.top, right: position.right }}
          >
            <Link
              href={localePath(locale, "/hesabim")}
              onClick={() => setOpen(false)}
              className="whitespace-nowrap rounded px-3 py-2 text-base font-medium hover:bg-brand-accent/40"
            >
              {dict.auth.myAccount}
            </Link>
            {ADMIN_PANEL_ROLES.includes(user.role) && (
              <Link
                href="/admin/users"
                onClick={() => setOpen(false)}
                className="whitespace-nowrap rounded px-3 py-2 text-base font-medium hover:bg-brand-accent/40"
              >
                {dict.auth.adminPanel}
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="whitespace-nowrap rounded px-3 py-2 text-left text-base font-medium text-red-600 hover:bg-brand-accent/40"
            >
              {dict.auth.logout}
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
