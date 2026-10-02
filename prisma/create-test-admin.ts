import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/password";

// Şifresi unutulan admin hesabından bağımsız, ayrı bir test admin hesabı
// oluşturur/günceller. E-posta zaten varsa şifresi ve rolü güncellenir,
// yoksa yeni bir ADMIN kullanıcısı olarak oluşturulur. Şifre asla düz
// metin olarak saklanmaz — bcrypt hash'e çevrilip passwordHash alanına
// yazılır (bkz. lib/password.ts).
//
// Kullanım (proje kök dizininde):
//   $env:TEST_ADMIN_EMAIL="test-admin@bookykitabevi.com"; $env:TEST_ADMIN_PASSWORD="..."; npx tsx prisma/create-test-admin.ts
//
// Not: Bu script Prisma CLI gibi sadece ".env" dosyasını okur, ".env.local"u
// değil. "npm run dev" ise Next.js kuralıyla ".env.local"ı önceliklendirir.
// İkisi farklı veritabanı gösteriyorsa, hangisine yazmak istediğine göre
// DATABASE_URL / DATABASE_URL_UNPOOLED'ı komutun önüne env değişkeni olarak
// ekleyerek geçici olarak override et.

async function main() {
  const email = process.env.TEST_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.TEST_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "TEST_ADMIN_EMAIL ve TEST_ADMIN_PASSWORD ortam değişkenleri tanımlı olmalı. Örnek:\n" +
        '  $env:TEST_ADMIN_EMAIL="test-admin@bookykitabevi.com"; $env:TEST_ADMIN_PASSWORD="..."; npx tsx prisma/create-test-admin.ts',
    );
    process.exit(1);
  }

  if (password.length < 12) {
    console.error("TEST_ADMIN_PASSWORD en az 12 karakter olmalı.");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "SUPER_ADMIN" },
    create: { email, passwordHash, name: "Test Admin", role: "SUPER_ADMIN" },
  });

  console.log(`"${user.email}" test admin hesabı hazır (role: ${user.role}).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
