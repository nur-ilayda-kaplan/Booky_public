import { notFound } from "next/navigation";
import { requireCmsSession } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";
import { PressMentionForm } from "./PressMentionForm";

export const metadata = { title: "Basın Haberi Düzenle" };

export default async function AdminPressMentionEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireCmsSession("/admin/press");
  const { id } = await params;

  if (id === "new") {
    return (
      <div>
        <h2 className="mb-6 text-lg font-semibold">Yeni Basın Haberi</h2>
        <PressMentionForm initial={null} />
      </div>
    );
  }

  const mention = await prisma.pressMention.findUnique({ where: { id } });
  if (!mention) notFound();

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">Basın Haberini Düzenle</h2>
      <PressMentionForm initial={mention} />
    </div>
  );
}
