import Link from "next/link";
import { requireCmsSession } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const metadata = { title: "Etkinlikler" };

export default async function AdminEventsListPage() {
  await requireCmsSession("/admin/events");

  const events = await prisma.event.findMany({
    orderBy: { date: "desc" },
    include: { authors: { include: { author: { select: { name: true } } } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Etkinlikler ({events.length})</h2>
        <Link
          href="/admin/events/new"
          className="rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Yeni Etkinlik
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/5 bg-black/[0.02] text-xs uppercase tracking-wide text-foreground/60">
            <tr>
              <th className="px-4 py-3">Başlık</th>
              <th className="px-4 py-3">Tarih</th>
              <th className="px-4 py-3">Yazarlar</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Güncellendi</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/events/${event.id}`} className="font-medium hover:underline">
                    {event.title || event.speaker || "(Başlıksız etkinlik)"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-foreground/60">
                  {event.date.toLocaleString("tr-TR", {
                    dateStyle: "medium",
                    timeStyle: event.hasTime ? "short" : undefined,
                    timeZone: "Europe/Istanbul",
                  })}
                </td>
                <td className="px-4 py-3 text-foreground/60">
                  {event.authors.length > 0
                    ? event.authors.map((eventAuthor) => eventAuthor.author.name).join(", ")
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={event.status} scheduledAt={event.scheduledAt} />
                </td>
                <td className="px-4 py-3 text-foreground/50">
                  {event.updatedAt.toLocaleDateString("tr-TR")}
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-foreground/40">
                  Henüz etkinlik eklenmedi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
