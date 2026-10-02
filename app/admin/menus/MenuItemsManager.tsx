"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import type { MenuItem, MenuLocation, MenuLinkType } from "@prisma/client";

export interface InternalPageOption {
  value: string;
  label: string;
}

export type CategoryOption = InternalPageOption;

function productCategoryUrl(slug: string) {
  return `/bookstore?category=${encodeURIComponent(slug)}`;
}

function parseCategoryFromUrl(url: string): string {
  try {
    const query = url.includes("?") ? url.slice(url.indexOf("?")) : "";
    return new URLSearchParams(query).get("category") ?? "";
  } catch {
    return "";
  }
}

interface DraftState {
  labelTr: string;
  labelEn: string;
  linkType: MenuLinkType;
  url: string;
  parentId: string;
  order: string;
  active: boolean;
  showOnMobile: boolean;
  openInNewTab: boolean;
}

const EMPTY_DRAFT: DraftState = {
  labelTr: "",
  labelEn: "",
  linkType: "INTERNAL",
  url: "",
  parentId: "",
  order: "0",
  active: true,
  showOnMobile: true,
  openInNewTab: false,
};

const LINK_TYPE_LABELS: Record<MenuLinkType, string> = {
  INTERNAL: "Dahili Sayfa",
  BLOG_CATEGORY: "Blog Kategorisi",
  PRODUCT_CATEGORY: "Ürün Kategorisi",
  EXTERNAL: "Harici Bağlantı",
};

// Blogda kategori kullanılmadığı için BLOG_CATEGORY yeni öğelerde seçilemez;
// enum ve etiket, DB'deki olası eski kayıtlar tabloda düzgün görünsün diye duruyor.
const SELECTABLE_LINK_TYPES = Object.entries(LINK_TYPE_LABELS).filter(
  ([value]) => value !== "BLOG_CATEGORY",
);

function toDraft(item: MenuItem): DraftState {
  return {
    labelTr: item.labelTr,
    labelEn: item.labelEn ?? "",
    linkType: item.linkType,
    url: item.url,
    parentId: item.parentId ?? "",
    order: item.order.toString(),
    active: item.active,
    showOnMobile: item.showOnMobile,
    openInNewTab: item.openInNewTab,
  };
}

export function MenuItemsManager({
  menu,
  initialItems,
  internalPages,
  productCategories,
}: {
  menu: MenuLocation;
  initialItems: MenuItem[];
  internalPages: InternalPageOption[];
  productCategories: CategoryOption[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const emptyDraft: DraftState = { ...EMPTY_DRAFT, url: internalPages[0]?.value ?? "" };
  const [draft, setDraft] = useState<DraftState>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const rootItems = items.filter((item) => !item.parentId);
  const childrenOf = (parentId: string) => items.filter((item) => item.parentId === parentId);

  function resetDraft() {
    setDraft(emptyDraft);
    setEditingId(null);
  }

  function startEdit(item: MenuItem) {
    setDraft(toDraft(item));
    setEditingId(item.id);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.labelTr || !draft.url) return;

    setSaving(true);
    setError("");

    const payload = {
      menu,
      labelTr: draft.labelTr,
      labelEn: draft.labelEn || null,
      linkType: draft.linkType,
      url: draft.url,
      parentId: draft.parentId || null,
      order: Number.parseInt(draft.order, 10) || 0,
      active: draft.active,
      showOnMobile: draft.showOnMobile,
      openInNewTab: draft.openInNewTab,
    };

    const url = editingId ? `/api/admin/menu-items/${editingId}` : "/api/admin/menu-items";
    const method = editingId ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (!response.ok) {
      setError("Kaydedilemedi.");
      return;
    }

    const data = await response.json();
    setItems((prev) => {
      if (editingId) {
        return prev.map((item) => (item.id === editingId ? data.item : item));
      }
      return [...prev, data.item];
    });
    resetDraft();
    router.refresh();
  }

  async function handleDelete(item: MenuItem) {
    if (!window.confirm(`"${item.labelTr}" öğesini silmek istediğinize emin misiniz?`)) return;

    const response = await fetch(`/api/admin/menu-items/${item.id}`, { method: "DELETE" });
    if (!response.ok) return;

    setItems((prev) => prev.filter((i) => i.id !== item.id && i.parentId !== item.id));
    router.refresh();
  }

  function renderRow(item: MenuItem, isChild: boolean) {
    return (
      <tr key={item.id} className="border-b border-black/5 last:border-0">
        <td className={`px-3 py-2 ${isChild ? "pl-8 text-foreground/70" : "font-medium"}`}>
          {isChild && "— "}
          {item.labelTr}
        </td>
        <td className="px-3 py-2 text-foreground/60">{LINK_TYPE_LABELS[item.linkType]}</td>
        <td className="max-w-40 truncate px-3 py-2 text-foreground/60">{item.url}</td>
        <td className="px-3 py-2">{item.order}</td>
        <td className="px-3 py-2">{item.active ? "Aktif" : "Pasif"}</td>
        <td className="px-3 py-2">{item.showOnMobile ? "Evet" : "Hayır"}</td>
        <td className="px-3 py-2">
          <button type="button" onClick={() => startEdit(item)} className="mr-3 text-brand-primary hover:underline">
            Düzenle
          </button>
          <button type="button" onClick={() => handleDelete(item)} className="text-red-600 hover:underline">
            Sil
          </button>
        </td>
      </tr>
    );
  }

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-black/5 bg-white p-5">
      {items.length > 0 && (
        <div className="overflow-x-auto rounded-md border border-black/5">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/5 bg-black/[0.02] text-xs uppercase tracking-wide text-foreground/60">
              <tr>
                <th className="px-3 py-2">Etiket</th>
                <th className="px-3 py-2">Tip</th>
                <th className="px-3 py-2">URL</th>
                <th className="px-3 py-2">Sıra</th>
                <th className="px-3 py-2">Aktif</th>
                <th className="px-3 py-2">Mobil</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {rootItems.map((item) => (
                <Fragment key={item.id}>
                  {renderRow(item, false)}
                  {childrenOf(item.id).map((child) => renderRow(child, true))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {items.length === 0 && (
        <p className="text-sm text-foreground/40">
          Henüz öğe eklenmedi — sitedeki mevcut sabit menü gösterilmeye devam ediyor.
        </p>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/70">Etiket (TR)</label>
          <input
            type="text"
            value={draft.labelTr}
            onChange={(event) => setDraft((prev) => ({ ...prev, labelTr: event.target.value }))}
            className="w-full rounded-md border border-black/10 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/70">Etiket (EN)</label>
          <input
            type="text"
            value={draft.labelEn}
            onChange={(event) => setDraft((prev) => ({ ...prev, labelEn: event.target.value }))}
            className="w-full rounded-md border border-black/10 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/70">Bağlantı Tipi</label>
          <select
            value={draft.linkType}
            onChange={(event) => {
              const linkType = event.target.value as MenuLinkType;
              let url = "";
              if (linkType === "INTERNAL") url = internalPages[0]?.value ?? "";
              else if (linkType === "PRODUCT_CATEGORY") {
                url = productCategories[0] ? productCategoryUrl(productCategories[0].value) : "";
              }
              setDraft((prev) => ({ ...prev, linkType, url }));
            }}
            className="w-full rounded-md border border-black/10 px-2 py-1.5 text-sm"
          >
            {SELECTABLE_LINK_TYPES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/70">Hedef</label>
          {draft.linkType === "EXTERNAL" && (
            <input
              type="text"
              value={draft.url}
              onChange={(event) => setDraft((prev) => ({ ...prev, url: event.target.value }))}
              placeholder="https://..."
              className="w-full rounded-md border border-black/10 px-2 py-1.5 text-sm"
            />
          )}
          {draft.linkType === "INTERNAL" && (
            <select
              value={draft.url}
              onChange={(event) => setDraft((prev) => ({ ...prev, url: event.target.value }))}
              className="w-full rounded-md border border-black/10 px-2 py-1.5 text-sm"
            >
              {internalPages.length === 0 && <option value="">— sayfa yok —</option>}
              {internalPages.map((page) => (
                <option key={page.value} value={page.value}>
                  {page.label}
                </option>
              ))}
            </select>
          )}
          {draft.linkType === "PRODUCT_CATEGORY" && (
            <select
              value={parseCategoryFromUrl(draft.url)}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, url: productCategoryUrl(event.target.value) }))
              }
              className="w-full rounded-md border border-black/10 px-2 py-1.5 text-sm"
            >
              {productCategories.length === 0 && <option value="">— ürün kategorisi yok —</option>}
              {productCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/70">Üst Menü</label>
          <select
            value={draft.parentId}
            onChange={(event) => setDraft((prev) => ({ ...prev, parentId: event.target.value }))}
            className="w-full rounded-md border border-black/10 px-2 py-1.5 text-sm"
          >
            <option value="">— Ana öğe —</option>
            {rootItems
              .filter((item) => item.id !== editingId)
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.labelTr}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/70">Sıra</label>
          <input
            type="number"
            value={draft.order}
            onChange={(event) => setDraft((prev) => ({ ...prev, order: event.target.value }))}
            className="w-full rounded-md border border-black/10 px-2 py-1.5 text-sm"
          />
        </div>
        <div className="col-span-2 flex items-end gap-4 sm:col-span-2">
          <label className="flex items-center gap-1.5 text-sm">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(event) => setDraft((prev) => ({ ...prev, active: event.target.checked }))}
            />
            Aktif
          </label>
          <label className="flex items-center gap-1.5 text-sm">
            <input
              type="checkbox"
              checked={draft.showOnMobile}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, showOnMobile: event.target.checked }))
              }
            />
            Mobilde göster
          </label>
          <label className="flex items-center gap-1.5 text-sm">
            <input
              type="checkbox"
              checked={draft.openInNewTab}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, openInNewTab: event.target.checked }))
              }
            />
            Yeni sekmede aç
          </label>
        </div>
        <div className="col-span-2 flex items-end gap-3 sm:col-span-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-brand-primary px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {editingId ? "Güncelle" : "Ekle"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetDraft}
              className="rounded-md border border-black/10 px-4 py-1.5 text-sm font-medium hover:bg-black/[0.03]"
            >
              İptal
            </button>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </form>
    </section>
  );
}
