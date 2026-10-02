import Image from "next/image";
import Link from "next/link";
import { requireCmsSession } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Ekibimiz" };

export default async function AdminTeamListPage() {
  await requireCmsSession("/admin/team");

  const team = await prisma.teamMember.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Ekibimiz ({team.length})</h2>
        <Link
          href="/admin/team/new"
          className="rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Yeni Kişi Ekle
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-black/[0.02] text-xs uppercase tracking-wide text-foreground/60">
            <tr>
              <th className="px-4 py-3">Fotoğraf</th>
              <th className="px-4 py-3">İsim</th>
              <th className="px-4 py-3">Unvan</th>
              <th className="px-4 py-3">Sıra</th>
            </tr>
          </thead>
          <tbody>
            {team.map((member) => (
              <tr key={member.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-brand-accent/20">
                    {member.photo && (
                      <Image src={member.photo} alt={member.name} fill sizes="40px" className="object-cover" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/team/${member.id}`} className="font-medium hover:underline">
                    {member.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-foreground/50">{member.role}</td>
                <td className="px-4 py-3 text-foreground/50">{member.order}</td>
              </tr>
            ))}
            {team.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-foreground/40">
                  Henüz ekip üyesi eklenmedi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
