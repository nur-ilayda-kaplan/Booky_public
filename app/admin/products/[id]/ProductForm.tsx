"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, ContentStatus } from "@prisma/client";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { IMAGE_SIZES, imageSizeHint } from "@/lib/constants/imageSizes";
import { SeoFields, type SeoFieldsState } from "@/components/admin/SeoFields";
import { StatusField } from "@/components/admin/StatusField";
import { toDateTimeInputValue } from "@/lib/formatDate";
import { slugify } from "@/lib/slugify";
import { SlugField } from "@/components/admin/SlugField";

interface FormState extends SeoFieldsState {
  title: string;
  slug: string;
  isbn: string;
  publisher: string;
  description: string;
  coverImage: string;
  pageCount: string;
  publishedYear: string;
  price: string;
  showPrice: boolean;
  featured: boolean;
  authorId: string;
  categoryId: string;
  status: ContentStatus;
  scheduledAt: string;
}

function toFormState(initial: Product | null): FormState {
  return {
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    isbn: initial?.isbn ?? "",
    publisher: initial?.publisher ?? "",
    description: initial?.description ?? "",
    coverImage: initial?.coverImage ?? "",
    pageCount: initial?.pageCount?.toString() ?? "",
    publishedYear: initial?.publishedYear?.toString() ?? "",
    price: initial?.price?.toString() ?? "",
    showPrice: initial?.showPrice ?? false,
    featured: initial?.featured ?? false,
    authorId: initial?.authorId ?? "",
    categoryId: initial?.categoryId ?? "",
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

export function ProductForm({
  initial,
  authors,
  categories,
  canPublish,
}: {
  initial: Product | null;
  authors: { id: string; name: string }[];
  categories: { id: string; nameTr: string }[];
  canPublish: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(toFormState(initial));
  // Var olan bir kitabı düzenlerken slug zaten belirli olduğu için elle
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

    const url = initial ? `/api/admin/products/${initial.id}` : "/api/admin/products";
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
    router.push(`/admin/products/${data.product.id}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!initial) return;
    if (!window.confirm(`"${initial.title}" kitabını silmek istediğinize emin misiniz?`)) return;

    const response = await fetch(`/api/admin/products/${initial.id}`, { method: "DELETE" });
    if (response.ok) {
      router.push("/admin/products");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-lg border border-black/5 bg-white p-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Kitap Adı</label>
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
          <label className="mb-1 block text-sm font-medium text-foreground/70">Açıklama</label>
          <textarea
            value={form.description}
            onChange={(event) => set("description", event.target.value)}
            rows={5}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
        </div>
        <ImageUploadField
          label="Kapak Görseli"
          value={form.coverImage}
          onChange={(url) => set("coverImage", url)}
          hint={imageSizeHint(IMAGE_SIZES.productCover)}
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">Yazar</label>
            <select
              value={form.authorId}
              onChange={(event) => set("authorId", event.target.value)}
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
            >
              <option value="">— Yazar seçin —</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">Kategori</label>
            <select
              value={form.categoryId}
              onChange={(event) => set("categoryId", event.target.value)}
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
            >
              <option value="">— Kategori seçin —</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nameTr}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Yayınevi</label>
          <input
            type="text"
            value={form.publisher}
            onChange={(event) => set("publisher", event.target.value)}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">ISBN</label>
            <input
              type="text"
              value={form.isbn}
              onChange={(event) => set("isbn", event.target.value)}
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">Sayfa Sayısı</label>
            <input
              type="number"
              value={form.pageCount}
              onChange={(event) => set("pageCount", event.target.value)}
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">Yayın Yılı</label>
            <input
              type="number"
              value={form.publishedYear}
              onChange={(event) => set("publishedYear", event.target.value)}
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/70">Fiyat (₺)</label>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(event) => set("price", event.target.value)}
              className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.showPrice}
                onChange={(event) => set("showPrice", event.target.checked)}
              />
              Fiyatı sitede göster
            </label>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event) => set("featured", event.target.checked)}
          />
          Öne çıkan kitap (vitrin)
        </label>
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
        fallbackDescription={form.description.slice(0, 160)}
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
