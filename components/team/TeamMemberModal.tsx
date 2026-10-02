"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";
import type { TeamMember } from "@/types";

const TRANSITION_MS = 200;

export function TeamMemberModal({
  member,
  onClose,
  closeLabel,
}: {
  member: TeamMember | null;
  onClose: () => void;
  closeLabel: string;
}) {
  const [displayMember, setDisplayMember] = useState<TeamMember | null>(null);
  const [visible, setVisible] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (member) {
      setDisplayMember(member);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }

    setVisible(false);
    const timeout = setTimeout(() => setDisplayMember(null), TRANSITION_MS);
    return () => clearTimeout(timeout);
  }, [member]);

  useEffect(() => {
    if (!displayMember) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus();
    };
  }, [displayMember, onClose]);

  if (!displayMember) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-member-modal-title"
        onClick={(event) => event.stopPropagation()}
        className={`relative flex w-full max-w-md max-h-[85vh] flex-col rounded-2xl bg-background shadow-xl transition-all duration-200 ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="absolute right-4 top-4 z-10 rounded-full bg-background/80 p-1 text-foreground/40 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <X size={20} />
        </button>

        {/* Kapatma butonu bu iç sarmalayıcının DIŞINDA — üye biyografisi
        uzun olup içerik viewport'tan taşınca (bkz. max-h-[85vh]) sadece bu
        alan dikeyde kaydırılabilir, buton her zaman sabit kalır. */}
        <div className="overflow-y-auto p-6 sm:p-8">
          <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-full bg-brand-accent/20 sm:h-48 sm:w-48">
            {displayMember.photo && (
              <Image
                src={displayMember.photo}
                alt={displayMember.name}
                fill
                sizes="192px"
                className="object-cover"
              />
            )}
          </div>
          <h2
            id="team-member-modal-title"
            className="mt-5 text-center font-serif text-2xl font-semibold"
          >
            {displayMember.name}
          </h2>
          <p className="mt-1 text-center text-base font-medium text-brand-primary">
            {displayMember.role}
          </p>
          {displayMember.bio && (
            <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-foreground/80">
              {displayMember.bio}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
