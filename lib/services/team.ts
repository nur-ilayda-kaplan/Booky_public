import { prisma } from "@/lib/prisma";
import { team as staticTeam } from "@/data/team";
import type { TeamMember } from "@/types";
import type { TeamMember as PrismaTeamMember } from "@prisma/client";

function mapDbTeamMember(member: PrismaTeamMember): TeamMember {
  return {
    id: member.id,
    name: member.name,
    role: member.role,
    photo: member.photo ?? "",
    bio: member.bio ?? "",
  };
}

async function getDbTeam(): Promise<TeamMember[]> {
  const rows = await prisma.teamMember.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return rows.map(mapDbTeamMember);
}

// DB'de ekip üyesi varsa onları kullan; hiç yoksa (henüz seed/panel içeriği
// girilmemişse) statik data/team.ts'e düş — Author/Product'taki DB-öncelikli
// + statik-yedekli desenin aynısı.
export async function getTeam(): Promise<TeamMember[]> {
  const dbTeam = await getDbTeam();
  return dbTeam.length > 0 ? dbTeam : staticTeam;
}
