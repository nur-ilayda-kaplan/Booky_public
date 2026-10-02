"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Slider } from "@prisma/client";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { IMAGE_SIZES, imageSizeHint } from "@/lib/constants/imageSizes";

const IMAGE_POSITIONS = [
  { value: "center", label: "Orta" },
  { value: "top", label: "Üst" },
  { value: "bottom", label: "Alt" },
  { value: "left", label: "Sol" },
  { value: "right", label: "Sağ" },
] as const;

interface FormState {
  imageDesktop: string;
  imageMobile: string;
  imagePosition: string;
  titleTr: string;
  titleEn: string;
  subtitleTr: string;
  subtitleEn: string;
  descriptionTr: string;
  descriptionEn: string;
  ctaHref: string;
  ctaLabelTr: string;
  ctaLabelEn: string;
  order: string;
  active: boolean;
}

function toFormState(initial: Slider | null): FormState {
  return {
    imageDesktop: initial?.imageDesktop ?? "",
    imageMobile: initial?.imageMobile ?? "",
    imagePosition: initial?.imagePosition ?? "center",
    titleTr: initial?.titleTr ?? "",
    titleEn: initial?.titleEn ?? "",
    subtitleTr: initial?.subtitleTr ?? "",
    subtitleEn: initial?.subtitleEn ?? "",
    descriptionTr: initial?.descriptionTr ?? "",
    descriptionEn: initial?.descriptionEn ?? "",
    ctaHref: initial?.ctaHref ?? "",
    ctaLabelTr: initial?.ctaLabelTr ?? "",
    ctaLabelEn: initial?.ctaLabelEn ?? "",
    order: initial?.order?.toString() ?? "0",
    active: initial?.active ?? true,
  };
}

export function SliderForm({ initial }: { initial: Slider | null }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(toFormState(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const url = initial ? `/api/admin/sliders/${initial.id}` : "/api/admin/sliders";
    const method = initial ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      setError("Kaydedilemedi.");
      setSaving(false);
      return;
    }

    const data = await response.json();
    router.push(`/admin/sliders/${data.slider.id}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!initial) return;
    if (!window.confirm(`"${initial.titleTr}" sliderını silmek istediğinize emin misiniz?`)) return;

    const response = await fetch(`/api/admin/sliders/${initial.id}`, { method: "DELETE" });
    if (response.ok) {
      router.push("/admin/sliders");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-lg border border-black/5 bg-white p-5">
        <ImageUploadField
          label="Masaüstü Görseli"
          value={form.imageDesktop}
          onChange={(url) => set("imageDesktop", url)}
          hint={imageSizeHint(IMAGE_SIZES.sliderDesktop)}
        />
        <ImageUploadField
          label="Mobil Görseli (opsiyonel)"
          value={form.imageMobile}
          onChange={(url) => set("imageMobile", url)}
          hint={imageSizeHint(IMAGE_SIZES.sliderMobile)}
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Görsel Konumu</label>
          <select
            value={form.imagePosition}
            onChange={(event) => set("imagePosition", event.target.value)}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          >
            {IMAGE_POSITIONS.map((position) => (
              <option key={position.value} value={position.value}>
                {position.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">Başlık (TR)</label>
            <input
              type="text"
              required
              value={form.titleTr}
              onChange={(event) => set("titleTr", event.target.value)}
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">Başlık (EN)</label>
            <input
              type="text"
              value={form.titleEn}
              onChange={(event) => set("titleEn", event.target.value)}
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">Alt Başlık (TR)</label>
            <input
              type="text"
              value={form.subtitleTr}
              onChange={(event) => set("subtitleTr", event.target.value)}
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">Alt Başlık (EN)</label>
            <input
              type="text"
              value={form.subtitleEn}
              onChange={(event) => set("subtitleEn", event.target.value)}
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">Açıklama (TR)</label>
            <textarea
              value={form.descriptionTr}
              onChange={(event) => set("descriptionTr", event.target.value)}
              rows={3}
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">Açıklama (EN)</label>
            <textarea
              value={form.descriptionEn}
              onChange={(event) => set("descriptionEn", event.target.value)}
              rows={3}
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Buton URL&apos;si</label>
          <input
            type="text"
            value={form.ctaHref}
            onChange={(event) => set("ctaHref", event.target.value)}
            placeholder="/bookstore"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">
              Buton Metni (TR)
            </label>
            <input
              type="text"
              value={form.ctaLabelTr}
              onChange={(event) => set("ctaLabelTr", event.target.value)}
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">
              Buton Metni (EN)
            </label>
            <input
              type="text"
              value={form.ctaLabelEn}
              onChange={(event) => set("ctaLabelEn", event.target.value)}
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">Sıra</label>
            <input
              type="number"
              value={form.order}
              onChange={(event) => set("order", event.target.value)}
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => set("active", event.target.checked)}
              />
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
