"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@prisma/client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatPrice } from "@/lib/formatPrice";

type ProductWithAuthor = Product & { author: { name: string } | null };

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

interface ImportSummaryDryRun {
  total: number;
  toCreate: number;
  toUpdate: number;
  invalid: number;
}

interface ImportSummaryCommit {
  total: number;
  created: number;
  updated: number;
  invalid: number;
  failed: number;
}

interface ImportRow {
  index: number;
  title: string | null;
  isbn: string | null;
  action: "create" | "update" | "created" | "updated" | "failed" | "invalid";
  errors: string[];
  warnings: string[];
}

type ImportPhase = "idle" | "parsing" | "preview" | "committing" | "done" | "error";

export function ProductsListClient({ products }: { products: ProductWithAuthor[] }) {
  const router = useRouter();
  const [usdRate, setUsdRate] = useState("");
  const [importPhase, setImportPhase] = useState<ImportPhase>("idle");
  const [previewSummary, setPreviewSummary] = useState<ImportSummaryDryRun | null>(null);
  const [commitSummary, setCommitSummary] = useState<ImportSummaryCommit | null>(null);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importError, setImportError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedFileRef = useRef<File | null>(null);

  const rateNumber = Number.parseFloat(usdRate.replace(",", "."));
  const hasValidRate = Number.isFinite(rateNumber) && rateNumber > 0;

  function resetImport() {
    setImportPhase("idle");
    setPreviewSummary(null);
    setCommitSummary(null);
    setImportRows([]);
    setImportError("");
    selectedFileRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    selectedFileRef.current = file;
    setImportError("");
    setImportPhase("parsing");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("commit", "false");

    const response = await fetch("/api/admin/products/import", { method: "POST", body: formData });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setImportError(data?.message || "XML dosyası okunamadı. Lütfen dosyayı kontrol edin.");
      setImportPhase("error");
      return;
    }

    setPreviewSummary(data.summary);
    setImportRows(data.rows);
    setImportPhase("preview");
  }

  async function handleConfirmImport() {
    const file = selectedFileRef.current;
    if (!file) return;
    setImportPhase("committing");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("commit", "true");
    if (hasValidRate) formData.append("usdRate", String(rateNumber));

    const response = await fetch("/api/admin/products/import", { method: "POST", body: formData });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setImportError(data?.message || "İçe aktarma sırasında bir hata oluştu.");
      setImportPhase("error");
      return;
    }

    setCommitSummary(data.summary);
    setImportRows(data.rows);
    setImportPhase("done");
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Kitaplar ({products.length})</h2>
          <div className="mt-2 flex items-center gap-2">
            <label className="text-sm font-medium text-foreground/70" htmlFor="usd-rate-input">
              USD Kuru
            </label>
            <input
              id="usd-rate-input"
              type="number"
              step="0.01"
              min="0"
              value={usdRate}
              onChange={(event) => setUsdRate(event.target.value)}
              placeholder="ör. 41.25"
              className="w-28 rounded-md border border-black/10 px-2 py-1 text-sm"
            />
            <span className="text-xs text-foreground/40">
              Sadece görüntüleme/kontrol amaçlı — kitap fiyatlarını değiştirmez.
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xml,text/xml,application/xml"
            onChange={handleFileSelected}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={importPhase === "parsing" || importPhase === "committing"}
            className="rounded-md border border-black/10 px-4 py-2 text-sm font-medium hover:bg-black/[0.03] disabled:opacity-50"
          >
            Import XML
          </button>
          {/* next/link burada YANLIŞ olur: bu bir sayfa değil dosya indirme
          endpoint'i — Link'in soft-navigation'ı App Router'ın kendi "_rsc"
          parametresini ekleyip XML'i RSC payload'u gibi fetch etmeye
          çalışıyor ve indirme hiç başlamıyor (test sırasında gözlendi).
          Düz <a download> ise next/next/no-html-link-for-pages kuralını da
          zaten tetiklemiyor (kural download linklerini sayfa navigasyonu
          saymıyor). */}
          <a
            href="/api/admin/products/export"
            download
            className="rounded-md border border-black/10 px-4 py-2 text-sm font-medium hover:bg-black/[0.03]"
          >
            Export XML
          </a>
          <Link
            href="/admin/products/new"
            className="rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Yeni Kitap
          </Link>
        </div>
      </div>

      {importPhase !== "idle" && (
        <div className="mb-6 rounded-lg border border-black/5 bg-white p-4">
          {importPhase === "parsing" && (
            <p className="text-sm text-foreground/60">XML dosyası yükleniyor...</p>
          )}

          {importPhase === "error" && (
            <>
              <p className="text-sm text-red-600">{importError}</p>
              <button
                type="button"
                onClick={resetImport}
                className="mt-3 rounded-md border border-black/10 px-3 py-1.5 text-sm font-medium hover:bg-black/[0.03]"
              >
                Kapat
              </button>
            </>
          )}

          {importPhase === "preview" && previewSummary && (
            <>
              <p className="text-sm font-medium">
                {previewSummary.total} kitap bulundu — {previewSummary.toCreate} yeni eklenecek,{" "}
                {previewSummary.toUpdate} mevcut ISBN nedeniyle güncellenecek
                {previewSummary.invalid > 0 && `, ${previewSummary.invalid} kayıt hatalı olduğu için atlanacak`}.
              </p>
              {previewSummary.invalid > 0 && (
                <ul className="mt-2 max-h-40 overflow-y-auto text-xs text-red-600">
                  {importRows
                    .filter((row) => row.action === "invalid")
                    .map((row) => (
                      <li key={row.index}>
                        Satır {row.index + 1}
                        {row.title ? ` (${row.title})` : ""}: {row.errors.join(", ")}
                      </li>
                    ))}
                </ul>
              )}
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={previewSummary.toCreate + previewSummary.toUpdate === 0}
                  className="rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  İçe Aktar
                </button>
                <button
                  type="button"
                  onClick={resetImport}
                  className="rounded-md border border-black/10 px-4 py-2 text-sm font-medium hover:bg-black/[0.03]"
                >
                  Vazgeç
                </button>
              </div>
            </>
          )}

          {importPhase === "committing" && (
            <p className="text-sm text-foreground/60">İçe aktarılıyor, lütfen bekleyin...</p>
          )}

          {importPhase === "done" && commitSummary && (
            <>
              <ul className="text-sm text-green-700">
                <li>{commitSummary.created} kitap başarıyla eklendi.</li>
                {commitSummary.updated > 0 && (
                  <li>{commitSummary.updated} kitap mevcut ISBN nedeniyle güncellendi.</li>
                )}
                {commitSummary.invalid > 0 && (
                  <li className="text-red-700">
                    {commitSummary.invalid} kayıt hatalı olduğu için aktarılmadı.
                  </li>
                )}
                {commitSummary.failed > 0 && (
                  <li className="text-red-700">{commitSummary.failed} kayıt bir hata nedeniyle kaydedilemedi.</li>
                )}
              </ul>
              <button
                type="button"
                onClick={resetImport}
                className="mt-3 rounded-md border border-black/10 px-3 py-1.5 text-sm font-medium hover:bg-black/[0.03]"
              >
                Kapat
              </button>
            </>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-black/[0.02] text-xs uppercase tracking-wide text-foreground/60">
            <tr>
              <th className="px-4 py-3">Kitap Adı</th>
              <th className="px-4 py-3">Yazar</th>
              <th className="px-4 py-3">Fiyat</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Güncellendi</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${product.id}`} className="font-medium hover:underline">
                    {product.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-foreground/60">{product.author?.name ?? "—"}</td>
                <td className="px-4 py-3 text-foreground/60">
                  {product.price !== null ? (
                    <div className="flex flex-col">
                      <span>{formatPrice(product.price)}</span>
                      {hasValidRate && (
                        <span className="text-xs text-foreground/40">
                          ≈ {formatUsd(product.price / rateNumber)}
                        </span>
                      )}
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={product.status} scheduledAt={product.scheduledAt} />
                </td>
                <td className="px-4 py-3 text-foreground/50">
                  {product.updatedAt.toLocaleDateString("tr-TR")}
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-foreground/40">
                  Henüz kitap eklenmedi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
