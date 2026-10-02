import Link from "next/link";
import { Newspaper } from "lucide-react";
import { localePath } from "@/lib/localePath";
import type { Locale } from "@/config/i18n.config";
import type { Dictionary } from "@/lib/getDictionary";

export function PressBanner({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <Link
      href={localePath(locale, "/press")}
      className="group mt-16 flex items-center gap-5 rounded-lg border border-black/5 bg-brand-accent/10 p-6 transition hover:shadow-md"
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
        <Newspaper size={26} />
      </span>
      <div>
        <h2 className="font-serif text-lg font-semibold group-hover:text-brand-primary">
          {dict.press.bannerTitle}
        </h2>
        <p className="mt-1 text-base text-foreground/60">{dict.press.bannerSubtitle}</p>
      </div>
    </Link>
  );
}
