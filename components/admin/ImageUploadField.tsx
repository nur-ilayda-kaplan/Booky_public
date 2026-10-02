"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

const DEFAULT_PREVIEW_CLASS =
  "relative h-16 w-16 shrink-0 overflow-hidden rounded border border-black/10 bg-black/[0.02]";

// image/* bazı tarayıcılarda SVG'yi dosya seçme diyaloğunda otomatik
// listelemeyebiliyor — bu yüzden SVG'yi ayrıca açıkça ekliyoruz.
export const IMAGE_UPLOAD_ACCEPT =
  "image/png,image/jpeg,image/webp,image/svg+xml,image/gif,image/*";

export function ImageUploadField({
  label,
  value,
  onChange,
  previewClassName = DEFAULT_PREVIEW_CLASS,
  hint,
  warning,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  previewClassName?: string;
  hint?: string;
  warning?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/upload", { method: "POST", body: formData });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      const message =
        data?.error === "UNSUPPORTED_TYPE"
          ? "Desteklenmeyen dosya türü. JPG/PNG/WebP/SVG/GIF kullanın."
          : data?.error === "FILE_TOO_LARGE"
            ? "Dosya çok büyük (max 5MB)."
            : data?.error === "UPLOAD_FAILED"
              ? `Yükleme başarısız oldu: ${data.detail ?? "bilinmeyen hata"}`
              : `Görsel yüklenemedi. (HTTP ${response.status}, ${data?.error ?? "yanıt okunamadı"})`;
      setError(message);
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const data = await response.json();
    onChange(data.url);
    setUploading(false);
  }

  function handleRemove() {
    onChange("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-foreground/70">{label}</label>
      <div className="flex items-center gap-3">
        {value && (
          <div className={previewClassName}>
            <Image src={value} alt="" fill sizes="96px" className="object-cover" />
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Görseli kaldır"
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-600"
            >
              <X size={12} />
            </button>
          </div>
        )}
        <div className="flex flex-col gap-1">
          <input
            ref={inputRef}
            type="file"
            accept={IMAGE_UPLOAD_ACCEPT}
            onChange={handleFileChange}
            disabled={uploading}
            className="text-sm"
          />
          {uploading && <p className="text-xs text-foreground/50">Yükleniyor...</p>}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
      {hint && <p className="mt-1 text-xs text-foreground/40">{hint}</p>}
      {warning && <p className="mt-1 text-xs text-amber-700">{warning}</p>}
    </div>
  );
}
