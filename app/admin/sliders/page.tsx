import Link from "next/link";
import { requireSuperAdminSession } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Sliderlar" };

export default async function AdminSlidersListPage() {
  await requireSuperAdminSession("/admin/sliders");

  const sliders = await prisma.slider.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Ana Sayfa Sliderları ({sliders.length})</h2>
        <Link
          href="/admin/sliders/new"
          className="rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Yeni Slider
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-black/[0.02] text-xs uppercase tracking-wide text-foreground/60">
            <tr>
              <th className="px-4 py-3">Başlık</th>
              <th className="px-4 py-3">Sıra</th>
              <th className="px-4 py-3">Durum</th>
            </tr>
          </thead>
          <tbody>
            {sliders.map((slider) => (
              <tr key={slider.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/sliders/${slider.id}`} className="font-medium hover:underline">
                    {slider.titleTr}
                  </Link>
                </td>
                <td className="px-4 py-3 text-foreground/60">{slider.order}</td>
                <td className="px-4 py-3">
                  {slider.active ? (
                    <span className="font-medium text-green-700">Aktif</span>
                  ) : (
                    <span className="text-foreground/50">Pasif</span>
                  )}
                </td>
              </tr>
            ))}
            {sliders.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-foreground/40">
                  Henüz slider eklenmedi — anasayfada mevcut sabit sliderlar gösteriliyor.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
