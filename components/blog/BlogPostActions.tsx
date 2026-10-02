"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Download, Link2, MoreHorizontal } from "lucide-react";
import type { Dictionary } from "@/lib/getDictionary";

// Blog yazısı sayfasındaki "⋯" menüsü: yazının bağlantısını kopyalar veya
// /api/blog/[slug]/story-image'da üretilen Instagram hikâyesi boyutundaki
// (1080×1920) görseli kaydeder — iOS'ta "Resmi Kaydet" için sistem menüsüyle,
// diğer cihazlarda indirerek.

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // navigator.clipboard sadece HTTPS'te (secure context) var; http
    // üzerinden açılan sayfalarda eski execCommand yöntemine düş.
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      textarea.remove();
    }
  }
}

// iPadOS 13+ kendini masaüstü Safari (Macintosh) olarak tanıtır; dokunmatik
// ekranından ayırt edilir.
function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1)
  );
}

export function BlogPostActions({
  url,
  imageUrl,
  fileName,
  dict,
}: {
  url: string;
  imageUrl: string;
  fileName: string;
  dict: Dictionary;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<Promise<File> | null>(null);

  function prefetchImage(): Promise<File> {
    if (!imageRef.current) {
      imageRef.current = fetch(imageUrl)
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.blob();
        })
        .then((blob) => new File([blob], fileName, { type: "image/png" }))
        .catch((error) => {
          imageRef.current = null;
          throw error;
        });
    }
    return imageRef.current;
  }

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  async function handleCopy() {
    setOpen(false);
    if (await copyToClipboard(url)) {
      setCopied(true);
      setMessage(dict.blog.linkCopied);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setMessage(dict.blog.actionError);
    }
  }

  async function handleSaveImage() {
    setOpen(false);
    setSaving(true);
    let file: File;
    try {
      file = await prefetchImage();
    } catch {
      setSaving(false);
      setMessage(dict.blog.actionError);
      return;
    }
    setSaving(false);

    // iPhone/iPad'de web sayfası Fotoğraflar'a doğrudan yazamaz; indirilen
    // dosya Dosyalar > İndirilenler'e gider. Sistem paylaşım menüsündeki
    // "Resmi Kaydet" ise görseli doğrudan Fotoğraflar'a kaydeder.
    if (isIOS() && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        // Görsel geç geldiyse Safari'nin kullanıcı etkileşimi süresi dolmuş
        // olabilir; dosya artık hazır, ikinci dokunuş anında açar.
        setMessage(
          error instanceof DOMException && error.name === "NotAllowedError"
            ? dict.blog.imageReadyTapAgain
            : dict.blog.actionError,
        );
      }
      return;
    }

    // Android ve masaüstü: indirilen görsel Android'de galeride de görünür.
    const objectUrl = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    setMessage(dict.blog.imageSaved);
  }

  const itemClass =
    "flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-black/[0.04]";

  return (
    <div ref={containerRef} className="relative ml-auto">
      <button
        type="button"
        onClick={() => {
          // Menü açılırken görseli indirmeye başla; "Görsel Olarak Kaydet"e
          // basıldığında hazır olursa iOS paylaşım menüsü sorunsuz açılır.
          if (!open) void prefetchImage().catch(() => {});
          setOpen((prev) => !prev);
        }}
        aria-label={dict.blog.moreOptions}
        title={dict.blog.moreOptions}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={saving}
        className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/60 transition hover:bg-black/5 hover:text-brand-primary disabled:cursor-wait disabled:opacity-60"
      >
        <MoreHorizontal className="h-5 w-5" aria-hidden />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-10 mt-1 w-56 overflow-hidden rounded-lg border border-black/10 bg-white py-1 text-foreground shadow-lg"
        >
          <button type="button" role="menuitem" onClick={handleCopy} className={itemClass}>
            {copied ? <Check className="h-4 w-4" aria-hidden /> : <Link2 className="h-4 w-4" aria-hidden />}
            {dict.blog.copyLink}
          </button>
          <button type="button" role="menuitem" onClick={handleSaveImage} className={itemClass}>
            <Download className="h-4 w-4" aria-hidden />
            {dict.blog.saveImage}
          </button>
        </div>
      )}
      <p
        aria-live="polite"
        className={`pointer-events-none absolute right-0 top-full mt-1 whitespace-nowrap rounded-md bg-foreground px-3 py-1.5 text-sm text-white shadow transition-opacity ${
          message || saving ? "opacity-100" : "opacity-0"
        }`}
      >
        {saving ? dict.blog.preparing : message}
      </p>
    </div>
  );
}
