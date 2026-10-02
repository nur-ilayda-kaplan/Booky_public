"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PressMention } from "@prisma/client";
import { toDateInputValue } from "@/lib/formatDate";

interface FormState {
  title: string;
  source: string;
  url: string;
  excerpt: string;
  publishedAt: string;
}

function toFormState(initial: PressMention | null): FormState {
  return {
    title: initial?.title ?? "",
    source: initial?.source ?? "",
    url: initial?.url ?? "",
    excerpt: initial?.excerpt ?? "",
    publishedAt: toDateInputValue(initial?.publishedAt),
  };
}

export function PressMentionForm({ initial }: { initial: PressMention | null }) {
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

    const url = initial ? `/api/admin/press/${initial.id}` : "/api/admin/press";
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
    const mentionId = initial ? initial.id : data.mention.id;
    router.push(`/admin/press/${mentionId}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!initial) return;
    if (!window.confirm(`"${initial.title}" adlı haberi silmek istediğinize emin misiniz?`)) return;

    const response = await fetch(`/api/admin/press/${initial.id}`, { method: "DELETE" });
    if (response.ok) {
      router.push("/admin/press");
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
            onChange={(event) => set("title", event.target.value)}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Kaynak</label>
          <input
            type="text"
            required
            value={form.source}
            onChange={(event) => set("source", event.target.value)}
            placeholder="ör. Kitap Gazetesi"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Haberin Linki</label>
          <input
            type="url"
            required
            value={form.url}
            onChange={(event) => set("url", event.target.value)}
            placeholder="https://..."
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Özet</label>
          <textarea
            required
            value={form.excerpt}
            onChange={(event) => set("excerpt", event.target.value)}
            rows={3}
            placeholder="/press sayfasındaki kartta gösterilen kısa özet."
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Yayın Tarihi</label>
          <input
            type="date"
            required
            value={form.publishedAt}
            onChange={(event) => set("publishedAt", event.target.value)}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
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
