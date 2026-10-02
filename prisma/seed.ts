import { prisma } from "../lib/prisma";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!email) {
    console.error(
      "ADMIN_EMAIL ortam değişkeni tanımlı değil. Örnek kullanım:\n" +
        '  $env:ADMIN_EMAIL="ornek@eposta.com"; npx prisma db seed',
    );
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(
      `"${email}" adresiyle kayıtlı bir kullanıcı bulunamadı. Önce siteden (/uye-ol) normal şekilde kayıt olun, ardından bu script'i tekrar çalıştırın.`,
    );
    process.exit(1);
  }

  if (user.role === "SUPER_ADMIN") {
    console.log(`"${email}" zaten SUPER_ADMIN.`);
    return;
  }

  await prisma.user.update({ where: { email }, data: { role: "SUPER_ADMIN" } });
  console.log(`"${email}" başarıyla SUPER_ADMIN yapıldı.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
