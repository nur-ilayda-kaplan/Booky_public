import { prisma } from "../lib/prisma";
import { team } from "../data/team";

// data/team.ts'teki statik ekip listesini admin panelden yönetilen gerçek
// TeamMember kayıtlarına çevirir — böylece admin/team'de görünür ve
// düzenlenebilir olurlar (bkz. lib/services/team.ts'teki fallback).
// Idempotent'tir: name alanına göre zaten içe aktarılmış bir üye varsa
// dokunulmaz, böylece admin panelden yapılmış düzenlemeler korunur —
// yalnızca eksik olanlar eklenir.
async function main() {
  let created = 0;
  let skipped = 0;

  for (const [index, member] of team.entries()) {
    const existing = await prisma.teamMember.findFirst({ where: { name: member.name } });
    if (existing) {
      skipped += 1;
      continue;
    }

    await prisma.teamMember.create({
      data: {
        name: member.name,
        role: member.role,
        photo: member.photo || null,
        bio: member.bio || null,
        order: index,
      },
    });
    created += 1;
  }

  console.log(`Oluşturulan ekip üyesi: ${created}`);
  console.log(`Zaten mevcut (dokunulmadı): ${skipped}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
