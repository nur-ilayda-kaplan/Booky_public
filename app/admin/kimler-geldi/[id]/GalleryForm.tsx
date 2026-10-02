"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EventGallery } from "@prisma/client";
import { MultiImageUploadField } from "@/components/admin/MultiImageUploadField";
import { IMAGE_SIZES, imageSizeHint } from "@/lib/constants/imageSizes";

const ERROR_MESSAGES: Record<string, string> = {
  EVENT_TAKEN: "Bu etkinliğin zaten bir galerisi var.",
  EVENT_NOT_FOUND: "Seçilen etkinlik bulunamadı.",
  NO_IMAGES: "En az bir fotoğraf yükleyin.",
  NO_NAME: "Bir etkinlik seçin ya da \"Kim Geldi?\" alanını doldurun.",
  INVALID_DATE: "Tarih geçersiz.",
};

export function GalleryForm({
  initial,
  eventOptions,
}: {
  initial: EventGallery | null;
  eventOptions: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [eventId, setEventId] = useState(initial?.eventId ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  // <input type="date"> İstanbul 00.00 kaydedilen günü UTC'de bir önceki
  // akşam olarak görmesin diye gün İstanbul saatine göre okunur.
  const [date, setDate] = useState(
    initial?.date ? initial.date.toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" }) : "",
  );
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [note, setNote] = useState(initial?.note ?? "");
  const [order, setOrder] = useState(initial?.order?.toString() ?? "0");
  const [active, setActive] = useState(initial?.active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (images.length === 0) {
      setError(ERROR_MESSAGES.NO_IMAGES);
      return;
    }
    if (!eventId && !name.trim()) {
      setError(ERROR_MESSAGES.NO_NAME);
      return;
    }
    setSaving(true);
    setError("");

    const response = await fetch(initial ? `/api/admin/kimler-geldi/${initial.id}` : "/api/admin/kimler-geldi", {
      method: initial ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, name, date, images, note, order, active }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(ERROR_MESSAGES[data?.error] ?? "Kaydedilemedi.");
      setSaving(false);
      return;
    }

    const data = await response.json();
    router.push(`/admin/kimler-geldi/${data.gallery.id}`);
    router.refresh();
    setSaving(false);
  }

  async function handleDelete() {
    if (!initial) return;
    if (!window.confirm("Bu galeriyi silmek istediğinize emin misiniz?")) return;

    const response = await fetch(`/api/admin/kimler-geldi/${initial.id}`, { method: "DELETE" });
    if (response.ok) {
      router.push("/admin/kimler-geldi");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-lg border border-black/5 bg-white p-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Kim Geldi?</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ör. İrem Uzunhasanoğlu"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-foreground/40">
            Kartta büyük başlık olarak gösterilir. Etkinlik seçtiyseniz boş bırakabilirsiniz —
            etkinliğin konuşmacısı kullanılır; etkinlik seçmediyseniz zorunludur.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Tarih</label>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-foreground/40">
            Opsiyonel — boşsa bağlı etkinliğin tarihi kullanılır; ikisi de yoksa kartta tarih
            gösterilmez. Galeriler en yeni tarih önce sıralanır.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Etkinlik</label>
          <select
            value={eventId}
            onChange={(event) => setEventId(event.target.value)}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          >
            <option value="">— Etkinliğe bağlama —</option>
            {eventOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-foreground/40">
            Opsiyonel. Seçilirse karta tıklanınca etkinliğin detay sayfası açılır ve fotoğraflar orada
            da görünür; seçilmezse fotoğraflar galeriye ait ayrı bir sayfada gösterilir. Her etkinliğe
            tek galeri bağlanabilir.
          </p>
        </div>

        <MultiImageUploadField
          label="Fotoğraflar *"
          value={images}
          onChange={setImages}
          hint={`${imageSizeHint(IMAGE_SIZES.eventGalleryPhoto)} — birden fazla dosya aynı anda seçilebilir. İlk fotoğraf kartta kapak olarak kullanılır; sırayı oklarla ya da "Kapak yap" ile değiştirip Kaydet'e basın — galeride de bu sırayla gösterilir.`}
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Not</label>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={2}
            placeholder="Ör. Hatırladığın Gibi söyleşisinden kareler"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-foreground/40">
            Opsiyonel — kartta konuşmacı adının altında italik gösterilir; boşsa etkinlik başlığı
            kullanılır.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">Sıra</label>
            <input
              type="number"
              value={order}
              onChange={(event) => setOrder(event.target.value)}
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-foreground/40">
              Küçük numara önce gösterilir (ana sayfada ilk 4). Sırayı Kimler Geldi? listesinde
              sürükleyip bırakarak da değiştirebilirsiniz.
            </p>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
              Aktif (sitede göster)
            </label>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-brand-primary px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
        {initial && (
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Sil
          </button>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </form>
  );
}
