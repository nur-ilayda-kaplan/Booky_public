import { requireSuperAdminSession } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./SettingsForm";

export const metadata = { title: "Genel Ayarlar" };

export default async function AdminSettingsPage() {
  await requireSuperAdminSession("/admin/settings");

  const settings = await prisma.siteSetting.findUnique({ where: { id: "singleton" } });

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">Genel Ayarlar</h2>
      <SettingsForm initial={settings} />
    </div>
  );
}
