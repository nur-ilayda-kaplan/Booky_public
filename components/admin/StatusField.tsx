"use client";

import type { ContentStatus } from "@prisma/client";

export function StatusField({
  value,
  onChange,
  scheduledAt,
  onScheduledAtChange,
  canPublish,
}: {
  value: ContentStatus;
  onChange: (value: ContentStatus) => void;
  scheduledAt: string;
  onScheduledAtChange: (value: string) => void;
  canPublish: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-black/5 bg-white p-5">
      <label className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
        Durum
      </label>
      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={value === "DRAFT"}
            onChange={() => onChange("DRAFT")}
          />
          Taslak
        </label>
        <label className={`flex items-center gap-2 ${canPublish ? "" : "opacity-40"}`}>
          <input
            type="radio"
            checked={value === "PUBLISHED"}
            disabled={!canPublish}
            onChange={() => onChange("PUBLISHED")}
          />
          Yayında
        </label>
        <label className={`flex items-center gap-2 ${canPublish ? "" : "opacity-40"}`}>
          <input
            type="radio"
            checked={value === "SCHEDULED"}
            disabled={!canPublish}
            onChange={() => onChange("SCHEDULED")}
          />
          Planlandı
        </label>
      </div>
      {value === "SCHEDULED" && (
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">
            Yayın Tarihi ve Saati
          </label>
          <input
            type="datetime-local"
            required
            value={scheduledAt}
            onChange={(event) => onScheduledAtChange(event.target.value)}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-foreground/40">
            Belirtilen tarih ve saat geldiğinde içerik otomatik olarak yayına alınır, ek bir
            işlem gerekmez.
          </p>
        </div>
      )}
      {!canPublish && (
        <p className="text-xs text-foreground/40">
          Yayınlama yetkisi sadece Yönetici rolündeki kullanıcılarda bulunur. Kaydınız taslak
          olarak saklanacak, bir yönetici onaylayıp yayınlayabilir.
        </p>
      )}
    </div>
  );
}
