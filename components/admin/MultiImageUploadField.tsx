"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { IMAGE_UPLOAD_ACCEPT } from "@/components/admin/ImageUploadField";

// Birden fazla görsel yükleme (ör. "Kimler Geldi?" galerisi). Seçilen
// dosyalar /api/admin/upload'a sırayla yüklenir; görseller sola/sağa
// kaydırılarak ya da "Kapak yap" ile başa alınarak sıralanır, ilk görsel
// kapak olarak kullanılır. Sıra formun Kaydet'iyle saklanır.
export function MultiImageUploadField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string[];
  onChange: (urls: string[]) => void;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState("");

  async function uploadOne(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
    if (response.ok) return (await response.json()).url as string;

    const data = await response.json().catch(() => null);
    const reason =
      data?.error === "UNSUPPORTED_TYPE"
        ? "desteklenmeyen dosya türü"
        : data?.error === "FILE_TOO_LARGE"
          ? "dosya çok büyük (max 5MB)"
          : (data?.detail ?? data?.error ?? `HTTP ${response.status}`);
    setError((prev) => `${prev}${prev ? " " : ""}${file.name}: ${reason}.`);
    return null;
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setError("");
    setUploading(files.length);
    let urls = value;
    for (const file of files) {
      const url = await uploadOne(file);
      if (url) {
        urls = [...urls, url];
        onChange(urls);
      }
      setUploading((count) => count - 1);
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function makeCover(index: number) {
    onChange([value[index], ...value.filter((_, i) => i !== index)]);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-foreground/70">{label}</label>
      {value.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {value.map((url, index) => (
            <div key={`${url}-${index}`} className="flex flex-col gap-1">
              <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-black/10 bg-black/[0.02]">
                <Image src={url} alt="" fill sizes="120px" className="object-cover" />
                {index === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    Kapak
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label="Görseli kaldır"
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Sola taşı"
                  className="rounded border border-black/10 p-0.5 hover:bg-black/[0.03] disabled:opacity-30"
                >
                  <ChevronLeft size={14} />
                </button>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => makeCover(index)}
                    className="rounded border border-black/10 px-1 text-[10px] font-medium hover:bg-black/[0.03]"
                  >
                    Kapak yap
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === value.length - 1}
                  aria-label="Sağa taşı"
                  className="rounded border border-black/10 p-0.5 hover:bg-black/[0.03] disabled:opacity-30"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={IMAGE_UPLOAD_ACCEPT}
        onChange={handleFileChange}
        disabled={uploading > 0}
        className="text-sm"
      />
      {uploading > 0 && <p className="mt-1 text-xs text-foreground/50">Yükleniyor... ({uploading} kaldı)</p>}
      {error && <p className="mt-1 text-xs text-red-600">Yüklenemedi — {error}</p>}
      {hint && <p className="mt-1 text-xs text-foreground/40">{hint}</p>}
    </div>
  );
}
