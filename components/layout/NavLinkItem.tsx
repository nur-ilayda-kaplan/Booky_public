import Link from "next/link";
import { localePath } from "@/lib/localePath";
import type { NavLink as NavLinkType } from "@/types/nav";
import type { Locale } from "@/config/i18n.config";

export function NavLinkItem({
  item,
  locale,
  className,
  onClick,
}: {
  item: NavLinkType;
  locale: Locale;
  className?: string;
  onClick?: () => void;
}) {
  if (item.external) {
    return (
      <a
        href={item.href}
        target={item.newTab ? "_blank" : undefined}
        rel={item.newTab ? "noopener noreferrer" : undefined}
        onClick={onClick}
        className={className}
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link href={localePath(locale, item.href)} onClick={onClick} className={className}>
      {item.label}
    </Link>
  );
}
