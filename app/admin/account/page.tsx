import { requireCmsSession } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";
import { AccountForm } from "./AccountForm";

export const metadata = { title: "Hesabım" };

export default async function AdminAccountPage() {
  const session = await requireCmsSession("/admin/account");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  if (!user) {
    return null;
  }

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">Hesabım</h2>
      <p className="mb-6 max-w-2xl text-sm text-foreground/60">
        Yönetim paneline giriş yaptığın e-posta adresini ve şifreni buradan değiştirebilirsin.
        Değişikliği kaydetmek için mevcut şifreni girmen gerekir; kaydettikten sonra güvenlik
        amacıyla otomatik olarak çıkış yapılır ve yeni bilgilerinle tekrar giriş yapman istenir.
      </p>
      <AccountForm initial={{ name: user.name, email: user.email }} />
    </div>
  );
}
