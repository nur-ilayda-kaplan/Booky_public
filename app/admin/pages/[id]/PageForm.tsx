"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Page, ContentStatus } from "@prisma/client";
import { SeoFields, type SeoFieldsState } from "@/components/admin/SeoFields";
import { StatusField } from "@/components/admin/StatusField";
import { toDateTimeInputValue } from "@/lib/formatDate";
import { slugify } from "@/lib/slugify";
import { SlugField } from "@/components/admin/SlugField";

interface FormState extends SeoFieldsState {
  title: string;
  slug: string;
  content: string;
  status: ContentStatus;
  scheduledAt: string;
}

function toFormState(initial: Page | null): FormState {
  return {
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    content: initial?.content ?? "",
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

export function PageForm({ initial, canPublish }: { initial: Page | null; canPublish: boolean }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(toFormState(initial));
  // Var olan bir sayfayı düzenlerken slug zaten belirli olduğu için elle
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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const url = initial ? `/api/admin/pages/${initial.id}` : "/api/admin/pages";
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
    router.push(`/admin/pages/${data.page.id}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!initial) return;
    if (!window.confirm(`"${initial.title}" sayfasını silmek istediğinize emin misiniz?`)) return;

    const response = await fetch(`/api/admin/pages/${initial.id}`, { method: "DELETE" });
    if (response.ok) {
      router.push("/admin/pages");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-lg border border-black/5 bg-white p-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Başlık</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(event) => handleTitleChange(event.target.value)}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
        </div>
        <SlugField
          value={form.slug}
          onChange={handleSlugChange}
          onGenerate={(slug) => set("slug", slug)}
          source={form.title}
          initialValue={initial?.slug}
          placeholder="ornek-sayfa"
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">İçerik</label>
          <textarea
            required
            value={form.content}
            onChange={(event) => set("content", event.target.value)}
            rows={10}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
        </div>
      </section>

      <StatusField
        value={form.status}
        onChange={(v) => set("status", v)}
        scheduledAt={form.scheduledAt}
        onScheduledAtChange={(v) => set("scheduledAt", v)}
        canPublish={canPublish}
      />

      <SeoFields
        value={form}
        onChange={(key, value) => setForm((prev) => ({ ...prev, [key]: value }))}
        fallbackTitle={form.title}
        fallbackDescription={form.content.slice(0, 160)}
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
