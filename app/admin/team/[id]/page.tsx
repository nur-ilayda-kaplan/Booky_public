import { notFound } from "next/navigation";
import { requireCmsSession } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";
import { TeamMemberForm } from "./TeamMemberForm";

export const metadata = { title: "Ekip Üyesi Düzenle" };

export default async function AdminTeamMemberEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireCmsSession("/admin/team");
  const { id } = await params;

  if (id === "new") {
    return (
      <div>
        <h2 className="mb-6 text-lg font-semibold">Yeni Kişi</h2>
        <TeamMemberForm initial={null} />
      </div>
    );
  }

  const member = await prisma.teamMember.findUnique({ where: { id } });
  if (!member) notFound();

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">Kişiyi Düzenle</h2>
      <TeamMemberForm initial={member} />
    </div>
  );
}
