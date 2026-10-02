"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Event, ContentStatus } from "@prisma/client";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { IMAGE_SIZES, imageSizeHint } from "@/lib/constants/imageSizes";
import { SeoFields, type SeoFieldsState } from "@/components/admin/SeoFields";
import { StatusField } from "@/components/admin/StatusField";
import { toDateTimeInputValue } from "@/lib/formatDate";
import { slugify } from "@/lib/slugify";
import { SlugField } from "@/components/admin/SlugField";

type EventWithAuthors = Event & { authors: { authorId: string }[] };

interface FormState extends SeoFieldsState {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  speaker: string;
  coverImage: string;
  calendarThumbnailUrl: string;
  capacity: string;
  authorIds: string[];
  status: ContentStatus;
  scheduledAt: string;
}

function toFormState(initial: EventWithAuthors | null): FormState {
  return {
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    shortDescription: initial?.shortDescription ?? "",
    description: initial?.description ?? "",
    // İstanbul saatine göre "YYYY-MM-DD" ve "HH:mm"; saatsiz etkinlikte saat boş.
    date: toDateTimeInputValue(initial?.date).slice(0, 10),
    time: initial?.hasTime === false ? "" : toDateTimeInputValue(initial?.date).slice(11, 16),
    location: initial?.location ?? "",
    category: initial?.category ?? "",
    speaker: initial?.speaker ?? "",
    coverImage: initial?.coverImage ?? "",
    calendarThumbnailUrl: initial?.calendarThumbnailUrl ?? "",
    capacity: initial?.capacity?.toString() ?? "",
    authorIds: initial?.authors.map((a) => a.authorId) ?? [],
    status: initial?.status ?? "DRAFT",
    scheduledAt: toDateTimeInputValue(initial?.scheduledAt),
    seoTitle: initial?.seoTitle ?? "",
    seoDescription: initial?.seoDescription ?? "",
    canonicalUrl: initial?.canonicalUrl ?? "",
    ogTitle: initial?.ogTitle ?? "",
    ogDescription: initial?.ogDescription ?? "",
    ogImage: initial?.ogImage ?? "",
    noIndex: initial?.noIndex ?? false,
  };
}

export function EventForm({
  initial,
  authors,
}: {
  initial: EventWithAuthors | null;
  authors: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(toFormState(initial));
  // Var olan bir etkinliği düzenlerken slug zaten belirli olduğu için elle
  // dokunulmuş sayılır — başlık değişse bile mevcut URL'i sessizce kaydırmayız.
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleTitleChange(value: string) {
    set("title", value);
    if (!slugTouched) {
      set("slug", slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    set("slug", value);
  }

  function handleAuthorsChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
    set("authorIds", selected);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const url = initial ? `/api/admin/events/${initial.id}` : "/api/admin/events";
    const method = initial ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error === "SLUG_TAKEN" ? "Bu slug zaten kullanılıyor." : "Kaydedilemedi.");
      setSaving(false);
      return;
    }

    const data = await response.json();
    router.push(`/admin/events/${data.event.id}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!initial) return;
    if (!window.confirm(`"${initial.title}" etkinliğini silmek istediğinize emin misiniz?`)) return;

    const response = await fetch(`/api/admin/events/${initial.id}`, { method: "DELETE" });
    if (response.ok) {
      router.push("/admin/events");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-lg border border-black/5 bg-white p-5">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">Kart ve Takvim</h2>
          <p className="mt-1 text-xs text-foreground/40">Ana sayfadaki ve etkinlikler sayfasındaki kartta yukarıdan aşağıya: Kategori hapı → Konuşmacı → Kısa Açıklama → Tarih. Takvim hücresinde Konuşmacı ve saat görünür. Yalnızca Tarih zorunludur; boş bırakılan alanlar (saat dahil) sitede gösterilmez.</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Konuşmacı / Sunan</label>
          <input
            type="text"
            value={form.speaker}
            onChange={(event) => set("speaker", event.target.value)}
            placeholder="Ör. İrem Uzunhasanoğlu"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-foreground/40">
            Kartta büyük başlık olarak ve takvim hücresinde gösterilir. Boş bırakılırsa seçili yazarların adı, o da yoksa Başlık kullanılır.
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Kategori</label>
          <input
            type="text"
            value={form.category}
            onChange={(event) => set("category", event.target.value)}
            placeholder="Ör. Bibliyoterapi, Online Söyleşi"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-foreground/40">
            Kartta konuşmacının üstünde küçük hap olarak gösterilir (ör. BİBLİYOTERAPİ). Boş bırakılırsa gösterilmez.
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Kısa Açıklama</label>
          <textarea
            value={form.shortDescription}
            onChange={(event) => set("shortDescription", event.target.value)}
            rows={2}
            placeholder="Ör. Hatırladığın Gibi"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-foreground/40">
            Kartta konuşmacı adının altında italik olarak gösterilir. Arama motoru açıklaması boşsa SEO açıklaması olarak da kullanılır.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-black/5 bg-white p-5">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">Detay Sayfası</h2>
          <p className="mt-1 text-xs text-foreground/40">Karta tıklanınca açılan sayfada Başlık ve Açıklama gösterilir.</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Başlık</label>
          <input
            type="text"
            value={form.title}
            onChange={(event) => handleTitleChange(event.target.value)}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-foreground/40">
            Etkinlik detay sayfasının başlığıdır; kartta görünmez (konuşmacı yoksa kart başlığı olarak kullanılır).
          </p>
        </div>
        <SlugField
          value={form.slug}
          onChange={handleSlugChange}
          onGenerate={(slug) => set("slug", slug)}
          source={form.title || form.speaker}
          initialValue={initial?.slug}
          required={false}
          placeholder="Boş bırakılırsa başlık/konuşmacı ve tarihten otomatik oluşturulur"
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Açıklama</label>
          <textarea
            value={form.description}
            onChange={(event) => set("description", event.target.value)}
            rows={6}
            placeholder="Etkinlik detay sayfasında gösterilen tam açıklama."
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-foreground/40">Sadece etkinlik detay sayfasında gösterilir.</p>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-black/5 bg-white p-5">
        <ImageUploadField
          label="Kapak Görseli"
          value={form.coverImage}
          onChange={(url) => set("coverImage", url)}
          hint={imageSizeHint(IMAGE_SIZES.eventCover)}
        />
        <ImageUploadField
          label="Takvim Küçük Resmi"
          value={form.calendarThumbnailUrl}
          onChange={(url) => set("calendarThumbnailUrl", url)}
          hint={`${imageSizeHint(IMAGE_SIZES.eventCalendarThumbnail)} — boş bırakılırsa aylık takvimde kapak görseli kare kırpılarak kullanılır.`}
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">Tarih <span className="text-red-600">*</span></label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(event) => set("date", event.target.value)}
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">Saat</label>
            <input
              type="time"
              value={form.time}
              onChange={(event) => set("time", event.target.value)}
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-foreground/40">
              Opsiyonel — boş bırakılırsa sitede yalnızca tarih gösterilir.
            </p>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Konum</label>
          <input
            type="text"
            value={form.location}
            onChange={(event) => set("location", event.target.value)}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Kontenjan</label>
          <input
            type="number"
            min={0}
            value={form.capacity}
            onChange={(event) => set("capacity", event.target.value)}
            placeholder="Boş bırakılırsa etkinlik detayında gösterilmez"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-foreground/40">
            0 girilirse detay sayfasında &quot;Kontenjan: Dolu&quot; yazar.
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Yazarlar</label>
          <select
            multiple
            value={form.authorIds}
            onChange={handleAuthorsChange}
            size={6}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          >
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-foreground/40">
            Birden fazla seçmek için Ctrl (Windows) veya Cmd (Mac) tuşunu basılı tutun.
          </p>
        </div>
      </section>

      <StatusField
        value={form.status}
        onChange={(v) => set("status", v)}
        scheduledAt={form.scheduledAt}
        onScheduledAtChange={(v) => set("scheduledAt", v)}
        canPublish
      />

      <SeoFields
        value={form}
        onChange={(key, value) => setForm((prev) => ({ ...prev, [key]: value }))}
        fallbackTitle={form.title}
        fallbackDescription={form.shortDescription}
      />

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
