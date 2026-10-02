"use client";

import { slugify } from "@/lib/slugify";

// Admin formlarındaki slug kutusu. Yeni kayıtta slug başlığı otomatik takip
// eder (bunu form yönetir); mevcut kayıtta URL sessizce değişmesin diye takip
// etmez — buradaki buton slug'ı başlıktan bilinçli olarak yeniden üretir.
export function SlugField({
  value,
  onChange,
  onGenerate,
  source,
  sourceLabel = "Başlıktan oluştur",
  initialValue,
  placeholder,
  required = true,
}: {
  value: string;
  onChange: (value: string) => void;
  onGenerate: (slug: string) => void;
  source: string;
  sourceLabel?: string;
  // Kayıtlı slug; değiştirildiyse adres değişikliği uyarısı gösterilir.
  initialValue?: string;
  placeholder?: string;
  // Etkinliklerde slug opsiyonel — boşsa sunucu üretir (bkz. lib/eventSlug.ts).
  required?: boolean;
}) {
  const generated = slugify(source);
  const canGenerate = generated !== "" && generated !== value;

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-foreground/70">Slug</label>
      <div className="flex gap-2">
        <input
          type="text"
          required={required}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full min-w-0 rounded-md border border-black/10 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => onGenerate(generated)}
          disabled={!canGenerate}
          className="shrink-0 rounded-md border border-black/10 px-3 py-2 text-sm font-medium hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {sourceLabel}
        </button>
      </div>
      {initialValue && value !== initialValue && (
        <p className="mt-1 text-xs text-amber-700">
          Kaydedince sayfanın adresi değişir; eski slug (<code>{initialValue}</code>) ile paylaşılmış
          bağlantılar çalışmaz.
        </p>
      )}
    </div>
  );
}
