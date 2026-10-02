"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Author } from "@prisma/client";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { IMAGE_SIZES, imageSizeHint } from "@/lib/constants/imageSizes";
import { slugify } from "@/lib/slugify";
import { SlugField } from "@/components/admin/SlugField";

interface FormState {
  name: string;
  slug: string;
  photo: string;
  shortBio: string;
  bio: string;
  socialInstagram: string;
  socialTwitter: string;
  socialWebsite: string;
  spotifyPlaylistUrl: string;
}

function toFormState(initial: Author | null): FormState {
  return {
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    photo: initial?.photo ?? "",
    shortBio: initial?.shortBio ?? "",
    bio: initial?.bio ?? "",
    socialInstagram: initial?.socialInstagram ?? "",
    socialTwitter: initial?.socialTwitter ?? "",
    socialWebsite: initial?.socialWebsite ?? "",
    spotifyPlaylistUrl: initial?.spotifyPlaylistUrl ?? "",
  };
}

export function AuthorForm({ initial }: { initial: Author | null }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(toFormState(initial));
  // Var olan bir yazarı düzenlerken slug zaten belirli olduğu için elle
  // dokunulmuş sayılır — isim değişse bile mevcut URL'i sessizce kaydırmayız.
  // Yeni yazarda isim yazıldıkça slug otomatik türetilir, kullanıcı slug
  // alanına dokunduğu an bu otomatik senkronizasyon durur.
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleNameChange(value: string) {
    set("name", value);
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

    const url = initial ? `/api/admin/authors/${initial.id}` : "/api/admin/authors";
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
    router.push(`/admin/authors/${data.author.id}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!initial) return;
    if (!window.confirm(`"${initial.name}" adlı yazarı silmek istediğinize emin misiniz?`)) return;

    const response = await fetch(`/api/admin/authors/${initial.id}`, { method: "DELETE" });
    if (response.ok) {
      router.push("/admin/authors");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-lg border border-black/5 bg-white p-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">İsim</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(event) => handleNameChange(event.target.value)}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
        </div>
        <SlugField
          value={form.slug}
          onChange={handleSlugChange}
          onGenerate={(slug) => set("slug", slug)}
          source={form.name}
          sourceLabel="İsimden oluştur"
          initialValue={initial?.slug}
        />
        <ImageUploadField
          label="Fotoğraf"
          value={form.photo}
          onChange={(url) => set("photo", url)}
          hint={imageSizeHint(IMAGE_SIZES.authorPhoto)}
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Kısa Biyografi</label>
          <textarea
            value={form.shortBio}
            onChange={(event) => set("shortBio", event.target.value)}
            rows={2}
            placeholder="Yazar kartlarında gösterilen kısa özet."
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Uzun Biyografi</label>
          <textarea
            value={form.bio}
            onChange={(event) => set("bio", event.target.value)}
            rows={6}
            placeholder="Yazar detay sayfasında gösterilen tam biyografi."
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-black/5 bg-white p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
          Sosyal Medya &amp; Bağlantılar
        </h3>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Instagram</label>
          <input
            type="text"
            value={form.socialInstagram}
            onChange={(event) => set("socialInstagram", event.target.value)}
            placeholder="https://instagram.com/..."
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Twitter / X</label>
          <input
            type="text"
            value={form.socialTwitter}
            onChange={(event) => set("socialTwitter", event.target.value)}
            placeholder="https://twitter.com/..."
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Web Sitesi</label>
          <input
            type="text"
            value={form.socialWebsite}
            onChange={(event) => set("socialWebsite", event.target.value)}
            placeholder="https://..."
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Spotify Playlist URL</label>
          <input
            type="text"
            value={form.spotifyPlaylistUrl}
            onChange={(event) => set("spotifyPlaylistUrl", event.target.value)}
            placeholder="https://open.spotify.com/embed/playlist/..."
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
