import type { ReactNode } from "react";

export function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-serif text-2xl font-semibold sm:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-base text-foreground/60">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
