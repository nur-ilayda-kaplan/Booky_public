"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BlogPost, ContentStatus } from "@prisma/client";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { IMAGE_SIZES, imageSizeHint } from "@/lib/constants/imageSizes";
import { SeoFields, type SeoFieldsState } from "@/components/admin/SeoFields";
import { StatusField } from "@/components/admin/StatusField";
import { toDateTimeInputValue } from "@/lib/formatDate";
import { slugify } from "@/lib/slugify";
import { SlugField } from "@/components/admin/SlugField";
import { normalizeAuthorName, toAuthorSlug, type BlogAuthorOption } from "@/lib/blogAuthor";

interface FormState extends SeoFieldsState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string;
  authorName: string;
  publishedAt: string;
  status: ContentStatus;
  scheduledAt: string;
}

function toDateInput(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

function toFormState(initial: BlogPost | null): FormState {
  return {
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "",
    coverImage: initial?.coverImage ?? "",
    tags: initial?.tags.join(", ") ?? "",
    authorName: initial?.authorName ?? "",
    publishedAt: toDateInput(initial?.publishedAt ?? null),
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

export function BlogForm({
  initial,
  canPublish,
  authorOptions,
}: {
  initial: BlogPost | null;
  canPublish: boolean;
  authorOptions: BlogAuthorOption[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(toFormState(initial));
  // Var olan bir yazıyı düzenlerken slug zaten belirli olduğu için elle
  // dokunulmuş sayılır — başlık değişse bile mevcut URL'i sessizce kaydırmayız.
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Girilen ad mevcut bir yazarla aynı slug'a düşüyor ama farklı yazılmışsa
  // (ör. "merve yilmaz" / "Merve Yılmaz") yerleşik yazımı öner.
  const typedAuthorName = normalizeAuthorName(form.authorName);
  const typedAuthorSlug = toAuthorSlug(typedAuthorName);
  const spellingMatch = typedAuthorSlug
    ? authorOptions.find(
        (option) => option.slug === typedAuthorSlug && option.name !== typedAuthorName,
      )
    : undefined;

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

    const url = initial ? `/api/admin/blog/${initial.id}` : "/api/admin/blog";
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
    router.push(`/admin/blog/${data.post.id}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!initial) return;
    if (!window.confirm(`"${initial.title}" yazısını silmek istediğinize emin misiniz?`)) return;

    const response = await fetch(`/api/admin/blog/${initial.id}`, { method: "DELETE" });
    if (response.ok) {
      router.push("/admin/blog");
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
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Özet</label>
          <textarea
            required
            value={form.excerpt}
            onChange={(event) => set("excerpt", event.target.value)}
            rows={2}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">İçerik (Markdown)</label>
          <textarea
            required
            value={form.content}
            onChange={(event) => set("content", event.target.value)}
            rows={10}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
        </div>
        <ImageUploadField
          label="Kapak Görseli"
          value={form.coverImage}
          onChange={(url) => set("coverImage", url)}
          hint={imageSizeHint(IMAGE_SIZES.blogCover)}
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Yazar</label>
          <input
            type="text"
            list="blog-author-options"
            value={form.authorName}
            onChange={(event) => set("authorName", event.target.value)}
            placeholder="Yazarın adı soyadı"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
          <datalist id="blog-author-options">
            {authorOptions.map((option) => (
              <option key={option.slug} value={option.name} />
            ))}
          </datalist>
          {spellingMatch && (
            <p className="mt-1 text-xs text-foreground/60">
              Bu yazar diğer yazılarda <strong>{spellingMatch.name}</strong> olarak geçiyor.{" "}
              <button
                type="button"
                onClick={() => set("authorName", spellingMatch.name)}
                className="font-medium text-brand-primary hover:underline"
              >
                Bu yazımı kullan
              </button>
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">
            Etiketler (virgülle ayırın)
          </label>
          <input
            type="text"
            value={form.tags}
            onChange={(event) => set("tags", event.target.value)}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Yayın Tarihi</label>
          <input
            type="date"
            value={form.publishedAt}
            onChange={(event) => set("publishedAt", event.target.value)}
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
        fallbackDescription={form.excerpt}
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
