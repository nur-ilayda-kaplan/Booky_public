import { requireSuperAdminSession } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";
import { DeleteCustomerButton } from "./DeleteCustomerButton";

export const metadata = { title: "Müşteriler" };

export default async function AdminCustomersPage() {
  await requireSuperAdminSession("/admin/customers");

  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">Müşteriler ({customers.length})</h2>
      <div className="overflow-x-auto rounded-lg border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-black/[0.02] text-xs uppercase tracking-wide text-foreground/60">
            <tr>
              <th className="px-4 py-3">İsim</th>
              <th className="px-4 py-3">E-posta</th>
              <th className="px-4 py-3">Kayıt Tarihi</th>
              <th className="px-4 py-3">Sipariş</th>
              <th className="px-4 py-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">{customer.name}</td>
                <td className="px-4 py-3">{customer.email}</td>
                <td className="px-4 py-3">{customer.createdAt.toLocaleDateString("tr-TR")}</td>
                <td className="px-4 py-3">{customer._count.orders}</td>
                <td className="px-4 py-3">
                  <DeleteCustomerButton userId={customer.id} name={customer.name} />
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-foreground/40">
                  Henüz müşteri kaydı yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
