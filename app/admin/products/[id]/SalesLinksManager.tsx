"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SalesLink } from "@prisma/client";

interface DraftLink {
  platform: string;
  label: string;
  url: string;
  order: string;
  active: boolean;
}

const EMPTY_DRAFT: DraftLink = { platform: "", label: "Satın Al", url: "", order: "0", active: true };

export function SalesLinksManager({
  productId,
  initialLinks,
}: {
  productId: string;
  initialLinks: SalesLink[];
}) {
  const router = useRouter();
  const [links, setLinks] = useState(initialLinks);
  const [draft, setDraft] = useState<DraftLink>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.platform || !draft.url) return;

    setSaving(true);
    setError("");

    const response = await fetch(`/api/admin/products/${productId}/sales-links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform: draft.platform,
        label: draft.label || "Satın Al",
        url: draft.url,
        order: Number.parseInt(draft.order, 10) || 0,
        active: draft.active,
      }),
    });

    setSaving(false);
    if (!response.ok) {
      setError("Satış linki eklenemedi.");
      return;
    }

    const data = await response.json();
    setLinks((prev) => [...prev, data.link].sort((a, b) => a.order - b.order));
    setDraft(EMPTY_DRAFT);
    router.refresh();
  }

  async function handleToggleActive(link: SalesLink) {
    const response = await fetch(`/api/admin/products/${productId}/sales-links/${link.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !link.active }),
    });
    if (!response.ok) return;
    const data = await response.json();
    setLinks((prev) => prev.map((l) => (l.id === link.id ? data.link : l)));
    router.refresh();
  }

  async function handleDelete(link: SalesLink) {
    if (!window.confirm(`"${link.platform}" satış linkini silmek istediğinize emin misiniz?`)) return;
    const response = await fetch(`/api/admin/products/${productId}/sales-links/${link.id}`, {
      method: "DELETE",
    });
    if (!response.ok) return;
    setLinks((prev) => prev.filter((l) => l.id !== link.id));
    router.refresh();
  }

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-black/5 bg-white p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
        Satış Bağlantıları
      </h3>
      <p className="text-xs text-foreground/40">
        Bu kitap için Booky, Trendyol, Hepsiburada gibi farklı satış kanallarına yönlendiren
        butonlar ekleyin. Kitap sayfasında sıra numarasına göre listelenir.
      </p>

      {links.length > 0 && (
        <div className="overflow-x-auto rounded-md border border-black/5">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/5 bg-black/[0.02] text-xs uppercase tracking-wide text-foreground/60">
              <tr>
                <th className="px-3 py-2">Platform</th>
                <th className="px-3 py-2">Buton Metni</th>
                <th className="px-3 py-2">URL</th>
                <th className="px-3 py-2">Sıra</th>
                <th className="px-3 py-2">Aktif</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} className="border-b border-black/5 last:border-0">
                  <td className="px-3 py-2 font-medium">{link.platform}</td>
                  <td className="px-3 py-2">{link.label}</td>
                  <td className="max-w-40 truncate px-3 py-2 text-foreground/60">{link.url}</td>
                  <td className="px-3 py-2">{link.order}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(link)}
                      className={link.active ? "text-green-700" : "text-foreground/40"}
                    >
                      {link.active ? "Aktif" : "Pasif"}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(link)}
                      className="text-red-600 hover:underline"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:items-end">
        <div className="col-span-1">
          <label className="mb-1 block text-xs font-medium text-foreground/70">Platform</label>
          <input
            type="text"
            value={draft.platform}
            onChange={(event) => setDraft((prev) => ({ ...prev, platform: event.target.value }))}
            placeholder="Booky / Trendyol"
            className="w-full rounded-md border border-black/10 px-2 py-1.5 text-sm"
          />
        </div>
        <div className="col-span-1">
          <label className="mb-1 block text-xs font-medium text-foreground/70">Buton Metni</label>
          <input
            type="text"
            value={draft.label}
            onChange={(event) => setDraft((prev) => ({ ...prev, label: event.target.value }))}
            className="w-full rounded-md border border-black/10 px-2 py-1.5 text-sm"
          />
        </div>
        <div className="col-span-2 sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-foreground/70">URL</label>
          <input
            type="url"
            value={draft.url}
            onChange={(event) => setDraft((prev) => ({ ...prev, url: event.target.value }))}
            placeholder="https://..."
            className="w-full rounded-md border border-black/10 px-2 py-1.5 text-sm"
          />
        </div>
        <div className="col-span-1 flex items-center gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-foreground/70">Sıra</label>
            <input
              type="number"
              value={draft.order}
              onChange={(event) => setDraft((prev) => ({ ...prev, order: event.target.value }))}
              className="w-full rounded-md border border-black/10 px-2 py-1.5 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mb-0.5 rounded-md bg-brand-primary px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            Ekle
          </button>
        </div>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </section>
  );
}
