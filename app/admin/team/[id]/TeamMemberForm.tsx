"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TeamMember } from "@prisma/client";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { IMAGE_SIZES, imageSizeHint } from "@/lib/constants/imageSizes";

interface FormState {
  name: string;
  role: string;
  photo: string;
  bio: string;
  order: string;
}

function toFormState(initial: TeamMember | null): FormState {
  return {
    name: initial?.name ?? "",
    role: initial?.role ?? "",
    photo: initial?.photo ?? "",
    bio: initial?.bio ?? "",
    order: initial?.order?.toString() ?? "0",
  };
}

export function TeamMemberForm({ initial }: { initial: TeamMember | null }) {
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

    const url = initial ? `/api/admin/team/${initial.id}` : "/api/admin/team";
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
    const memberId = initial ? initial.id : data.member.id;
    router.push(`/admin/team/${memberId}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!initial) return;
    if (!window.confirm(`"${initial.name}" adlı kişiyi silmek istediğinize emin misiniz?`)) return;

    const response = await fetch(`/api/admin/team/${initial.id}`, { method: "DELETE" });
    if (response.ok) {
      router.push("/admin/team");
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
            onChange={(event) => set("name", event.target.value)}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Unvan</label>
          <input
            type="text"
            required
            value={form.role}
            onChange={(event) => set("role", event.target.value)}
            placeholder="ör. Kurucu, Sosyal Medya ve Tasarım"
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
        </div>
        <ImageUploadField
          label="Fotoğraf"
          value={form.photo}
          onChange={(url) => set("photo", url)}
          hint={imageSizeHint(IMAGE_SIZES.teamMemberPhoto)}
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Biyografi</label>
          <textarea
            value={form.bio}
            onChange={(event) => set("bio", event.target.value)}
            rows={8}
            placeholder="Kart üzerinde ilk birkaç satırı, tıklanınca açılan modalda tamamı gösterilir. Paragraflar arasında boş satır bırakabilirsiniz."
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground/70">Sıra</label>
          <input
            type="number"
            value={form.order}
            onChange={(event) => set("order", event.target.value)}
            className="w-full rounded-md border border-black/10 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-foreground/40">
            Ekip listesinde küçükten büyüğe sıralanır — ör. kurucu 0, sonraki kişiler 1, 2, 3...
          </p>
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
