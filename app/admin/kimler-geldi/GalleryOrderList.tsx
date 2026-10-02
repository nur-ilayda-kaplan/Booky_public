"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";

export type GalleryRow = {
  id: string;
  name: string;
  date: string;
  cover: string;
  imageCount: number;
  order: number;
  active: boolean;
};

// Admin "Kimler Geldi?" listesi: satırlar soldaki tutamaktan sürüklenerek
// (pointer olayları — fare, dokunmatik ve kalemde aynı çalışır; HTML5
// drag-and-drop dokunmatikte çalışmadığı için kullanılmadı) ya da ↑/↓ ile
// sıralanır; "Sırayı Kaydet" ile /api/admin/kimler-geldi/order'a
// gönderilir ve Sıra numaraları 1, 2, 3… olarak yeniden yazılır. Sitede
// (ana sayfa + Kimler Geldi sayfası) bu sırayla gösterilir.
export function GalleryOrderList({ rows }: { rows: GalleryRow[] }) {
  const router = useRouter();
  const [items, setItems] = useState(rows);
  const [dragId, setDragId] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const dirty = items.some((item, index) => item.id !== rows[index]?.id);

  function moveTo(fromId: string, toId: string) {
    if (fromId === toId) return;
    setItems((current) => {
      const from = current.findIndex((item) => item.id === fromId);
      const to = current.findIndex((item) => item.id === toId);
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setMessage(null);
  }

  // Sürüklerken imlecin dikey konumundaki satırı bulup sürüklenen satırı
  // canlı olarak oraya taşır.
  function handlePointerMove(event: React.PointerEvent) {
    if (!dragId || !listRef.current) return;
    const rows = [...listRef.current.querySelectorAll<HTMLElement>("[data-gallery-id]")];
    const target = rows.find((row) => {
      const rect = row.getBoundingClientRect();
      return event.clientY >= rect.top && event.clientY <= rect.bottom;
    });
    const targetId = target?.dataset.galleryId;
    if (targetId && targetId !== dragId) moveTo(dragId, targetId);
  }

  function moveBy(index: number, direction: -1 | 1) {
    const target = items[index + direction];
    if (target) moveTo(items[index].id, target.id);
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    const response = await fetch("/api/admin/kimler-geldi/order", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: items.map((item) => item.id) }),
    });
    setSaving(false);
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setMessage({
        type: "error",
        text:
          data?.error === "LIST_CHANGED"
            ? "Liste bu sırada değişmiş (galeri eklenmiş ya da silinmiş). Sayfayı yenileyip tekrar deneyin."
            : "Sıra kaydedilemedi.",
      });
      return;
    }
    setMessage({ type: "ok", text: "Sıra kaydedildi." });
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-black/5 bg-white px-4 py-6 text-center text-sm text-foreground/40">
        Henüz galeri eklenmedi — ana sayfadaki &quot;Kimler Geldi?&quot; bölümü gizli.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ul ref={listRef} className="overflow-hidden rounded-lg border border-black/5 bg-white">
        {items.map((item, index) => (
          <li
            key={item.id}
            data-gallery-id={item.id}
            className={`flex items-center gap-3 border-b border-black/5 px-3 py-2 text-sm last:border-0 ${
              dragId === item.id ? "relative z-10 bg-brand-primary/5 shadow-md ring-1 ring-inset ring-brand-primary/40" : ""
            }`}
          >
            <span
              role="presentation"
              title="Sürükleyerek sırala"
              onPointerDown={(event) => {
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                setDragId(item.id);
                setMessage(null);
              }}
              onPointerMove={handlePointerMove}
              onPointerUp={() => setDragId(null)}
              onPointerCancel={() => setDragId(null)}
              className={`touch-none select-none p-1 text-foreground/30 hover:text-foreground/60 ${
                dragId === item.id ? "cursor-grabbing" : "cursor-grab"
              }`}
            >
              <GripVertical size={18} />
            </span>
            <span className="w-6 text-right text-xs tabular-nums text-foreground/40">{index + 1}</span>
            <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded border border-black/10 bg-black/[0.02]">
              {item.cover && <Image src={item.cover} alt="" fill sizes="40px" className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/admin/kimler-geldi/${item.id}`}
                draggable={false}
                className="block truncate font-medium hover:underline"
              >
                {item.name}
              </Link>
              <p className="text-xs text-foreground/50">
                {item.date} · {item.imageCount} fotoğraf
              </p>
            </div>
            {item.active ? (
              <span className="text-xs font-medium text-green-700">Aktif</span>
            ) : (
              <span className="text-xs text-foreground/50">Pasif</span>
            )}
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => moveBy(index, -1)}
                disabled={index === 0}
                aria-label={`${item.name} yukarı taşı`}
                className="rounded p-0.5 hover:bg-black/[0.04] disabled:opacity-20"
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => moveBy(index, 1)}
                disabled={index === items.length - 1}
                aria-label={`${item.name} aşağı taşı`}
                className="rounded p-0.5 hover:bg-black/[0.04] disabled:opacity-20"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving}
          className="rounded-md bg-brand-primary px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
        >
          {saving ? "Kaydediliyor..." : "Sırayı Kaydet"}
        </button>
        {dirty && !saving && (
          <button
            type="button"
            onClick={() => {
              setItems(rows);
              setMessage(null);
            }}
            className="rounded-md border border-black/10 px-4 py-2 text-sm hover:bg-black/[0.03]"
          >
            Vazgeç
          </button>
        )}
        {message && (
          <p className={`text-sm ${message.type === "ok" ? "text-green-700" : "text-red-600"}`}>
            {message.text}
          </p>
        )}
        {dirty && !message && <p className="text-xs text-foreground/50">Sıra değişti — kaydetmeyi unutmayın.</p>}
      </div>
    </div>
  );
}
