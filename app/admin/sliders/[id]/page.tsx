import { notFound } from "next/navigation";
import { requireSuperAdminSession } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";
import { SliderForm } from "./SliderForm";

export const metadata = { title: "Slider Düzenle" };

export default async function AdminSliderEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSuperAdminSession("/admin/sliders");
  const { id } = await params;

  if (id === "new") {
    return (
      <div>
        <h2 className="mb-6 text-lg font-semibold">Yeni Slider</h2>
        <SliderForm initial={null} />
      </div>
    );
  }

  const slider = await prisma.slider.findUnique({ where: { id } });
  if (!slider) notFound();

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">Sliderı Düzenle</h2>
      <SliderForm initial={slider} />
    </div>
  );
}
