"use client";

import { ImageUploadField } from "./ImageUploadField";
import { IMAGE_SIZES, imageSizeHint } from "@/lib/constants/imageSizes";

export interface SeoFieldsState {
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  noIndex: boolean;
}

export const SEO_TITLE_MAX = 60;
export const SEO_DESCRIPTION_MAX = 160;

export function SeoFields({
  value,
  onChange,
  fallbackTitle,
  fallbackDescription,
}: {
  value: SeoFieldsState;
  onChange: (key: keyof SeoFieldsState, val: string | boolean) => void;
  fallbackTitle?: string;
  fallbackDescription?: string;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-black/5 bg-white p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
        SEO Ayarları
      </h3>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm font-medium text-foreground/70">SEO Başlığı (Title)</label>
          <span
            className={`text-xs ${
              value.seoTitle.length > SEO_TITLE_MAX ? "text-red-600" : "text-foreground/40"
            }`}
          >
            {value.seoTitle.length}/{SEO_TITLE_MAX}
          </span>
        </div>
        <input
          type="text"
          value={value.seoTitle}
          onChange={(event) => onChange("seoTitle", event.target.value)}
          placeholder={fallbackTitle}
          className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
        />
        {!value.seoTitle && fallbackTitle && (
          <p className="mt-1 text-xs text-foreground/40">Boşsa otomatik olarak başlıktan üretilir.</p>
        )}
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm font-medium text-foreground/70">Meta Açıklama</label>
          <span
            className={`text-xs ${
              value.seoDescription.length > SEO_DESCRIPTION_MAX ? "text-red-600" : "text-foreground/40"
            }`}
          >
            {value.seoDescription.length}/{SEO_DESCRIPTION_MAX}
          </span>
        </div>
        <textarea
          value={value.seoDescription}
          onChange={(event) => onChange("seoDescription", event.target.value)}
          placeholder={fallbackDescription}
          rows={2}
          className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
        />
        {!value.seoDescription && fallbackDescription && (
          <p className="mt-1 text-xs text-foreground/40">Boşsa otomatik olarak özetten üretilir.</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground/70">URL Slug</label>
        <p className="text-xs text-foreground/40">
          Yukarıdaki genel Slug alanından yönetilir.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground/70">Canonical URL</label>
        <input
          type="text"
          value={value.canonicalUrl}
          onChange={(event) => onChange("canonicalUrl", event.target.value)}
          className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground/70">
          Open Graph Başlığı
        </label>
        <input
          type="text"
          value={value.ogTitle}
          onChange={(event) => onChange("ogTitle", event.target.value)}
          className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground/70">
          Open Graph Açıklaması
        </label>
        <textarea
          value={value.ogDescription}
          onChange={(event) => onChange("ogDescription", event.target.value)}
          rows={2}
          className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
        />
      </div>

      <ImageUploadField
        label="Open Graph / Vitrin Görseli"
        value={value.ogImage}
        onChange={(url) => onChange("ogImage", url)}
        hint={imageSizeHint(IMAGE_SIZES.seoOgImage)}
        warning={IMAGE_SIZES.seoOgImage.warning}
      />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={value.noIndex}
          onChange={(event) => onChange("noIndex", event.target.checked)}
        />
        Arama motorlarından gizle (noindex)
      </label>
    </section>
  );
}
