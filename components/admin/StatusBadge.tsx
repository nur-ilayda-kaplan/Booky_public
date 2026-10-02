import type { ContentStatus } from "@prisma/client";
import { formatDateTime } from "@/lib/formatDate";

export function StatusBadge({
  status,
  scheduledAt,
}: {
  status: ContentStatus;
  scheduledAt: Date | null;
}) {
  if (status === "PUBLISHED") {
    return <span className="font-medium text-green-700">Yayında</span>;
  }
  if (status === "SCHEDULED") {
    return (
      <span className="font-medium text-amber-700">
        Planlandı: {scheduledAt ? formatDateTime(scheduledAt.toISOString()) : "—"}
      </span>
    );
  }
  return <span className="text-foreground/50">Taslak</span>;
}
