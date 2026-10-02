import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/password";
import type { Role } from "@prisma/client";

// 4 rolün (SUPER_ADMIN, BLOG_MANAGER, BLOG_AUTHOR, PRODUCT_MANAGER) her biri
// için panel testine hazır birer hesap oluşturur/günceller — aynı e-postayla
// tekrar çalıştırmak güvenlidir (upsert). Şifre asla düz metin saklanmaz —
// bcrypt hash'e çevrilip passwordHash alanına yazılır (bkz. lib/password.ts).
// BLOG_AUTHOR hesabına ayrıca UserCategoryAccess üzerinden birkaç kategori
// atanır (bkz. lib/adminGuard.ts — panele girebilen her rol tüm kategorilerde
// yazabildiği için bu atamanın artık işlevsel bir etkisi yok).
//
// Şifre sabit kodlanmadı (bkz. create-test-admin.ts/reset-password.ts'teki
// aynı desen) — bu script çalıştırıldığında script'i çalıştıran kişinin
// seçtiği bir değer kullanılır, git'e hiçbir zaman gerçek bir şifre girmez.
// Bu script'i tekrar çalıştırmak, hesaplar admin panelden farklı bir şifreye
// sahipse o şifreyi BURADA verdiğiniz değere sıfırlar — panelden elle
// değiştirilmiş bir şifreyi korumak istiyorsanız bu script'i çalıştırmayın.
//
// Kullanım (proje kök dizininde, .env doğru veritabanını gösteriyor olmalı):
//   $env:TEST_USERS_PASSWORD="..."; npx tsx prisma/create-test-users.ts

const ACCOUNTS: { email: string; name: string; role: Role }[] = [
  { email: "test-admin@bookykitabevi.com", name: "Test Süper Yönetici", role: "SUPER_ADMIN" },
  { email: "blog-yoneticisi-test@bookykitabevi.com", name: "Test Blog Yöneticisi", role: "BLOG_MANAGER" },
  { email: "blog-yazari-test@bookykitabevi.com", name: "Test Blog Yazarı", role: "BLOG_AUTHOR" },
  { email: "urun-yoneticisi-test@bookykitabevi.com", name: "Test Ürün Yöneticisi", role: "PRODUCT_MANAGER" },
];

async function main() {
  const password = process.env.TEST_USERS_PASSWORD;
  if (!password) {
    console.error(
      "TEST_USERS_PASSWORD ortam değişkeni tanımlı olmalı. Örnek:\n" +
        '  $env:TEST_USERS_PASSWORD="..."; npx tsx prisma/create-test-users.ts',
    );
    process.exit(1);
  }
  if (password.length < 12) {
    console.error("TEST_USERS_PASSWORD en az 12 karakter olmalı.");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);

  const users: Record<string, string> = {};
  for (const account of ACCOUNTS) {
    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: { passwordHash, role: account.role, name: account.name },
      create: { email: account.email, passwordHash, name: account.name, role: account.role },
    });
    users[account.email] = user.id;
    console.log(`"${user.email}" hazır (role: ${user.role}).`);
  }

  const blogAuthorId = users["blog-yazari-test@bookykitabevi.com"];
  const categories = await prisma.category.findMany({ take: 2, orderBy: { nameTr: "asc" } });

  if (categories.length === 0) {
    console.log("Hiç kategori bulunamadı, Blog Yazarı hesabına atama yapılmadı.");
  } else {
    for (const category of categories) {
      await prisma.userCategoryAccess.upsert({
        where: { userId_categoryId: { userId: blogAuthorId, categoryId: category.id } },
        update: {},
        create: { userId: blogAuthorId, categoryId: category.id },
      });
    }
    console.log(
      `Blog Yazarı test hesabına ${categories.length} kategori atandı: ${categories
        .map((c) => c.nameTr)
        .join(", ")}.`,
    );
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
