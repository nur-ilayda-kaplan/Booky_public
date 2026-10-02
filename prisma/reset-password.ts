import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/password";

// Var olan (veya yoksa yeni) bir kullanıcının şifresini elle belirlenen bir
// değere sıfırlar ve rolünü ADMIN yapar. Şifre asla düz metin olarak
// saklanmaz — bcrypt hash'e çevrilip passwordHash alanına yazılır.
//
// Kullanım (proje kök dizininde):
//   $env:ADMIN_EMAIL="senin@eposta.com"; $env:ADMIN_PASSWORD="yeni-guclu-sifre"; npx tsx prisma/reset-password.ts
//
// Not: Bu script Prisma CLI gibi sadece ".env" dosyasını okur, ".env.local"u değil.
// Hangi veritabanına yazdığını netleştirmek için komutu çalıştırmadan önce
// terminalde "type .env" ile DATABASE_URL'i kontrol et.

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "ADMIN_EMAIL ve ADMIN_PASSWORD ortam değişkenleri tanımlı olmalı. Örnek:\n" +
        '  $env:ADMIN_EMAIL="ornek@eposta.com"; $env:ADMIN_PASSWORD="YeniSifre123!"; npx tsx prisma/reset-password.ts',
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("ADMIN_PASSWORD en az 8 karakter olmalı.");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { passwordHash, role: "SUPER_ADMIN" },
    });
    console.log(`"${email}" kullanıcısının şifresi sıfırlandı ve rolü ADMIN yapıldı.`);
  } else {
    await prisma.user.create({
      data: { email, passwordHash, name: "Admin", role: "SUPER_ADMIN" },
    });
    console.log(`"${email}" için yeni bir ADMIN kullanıcısı oluşturuldu.`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
