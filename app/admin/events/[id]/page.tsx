import { notFound } from "next/navigation";
import { requireCmsSession } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";
import { EventForm } from "./EventForm";

export const metadata = { title: "Etkinlik Düzenle" };

export default async function AdminEventEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireCmsSession("/admin/events");
  const { id } = await params;

  const authors = await prisma.author.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  if (id === "new") {
    return (
      <div>
        <h2 className="mb-6 text-lg font-semibold">Yeni Etkinlik</h2>
        <EventForm initial={null} authors={authors} />
      </div>
    );
  }

  const event = await prisma.event.findUnique({
    where: { id },
    include: { authors: { select: { authorId: true } } },
  });
  if (!event) notFound();

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">Etkinliği Düzenle</h2>
      <EventForm initial={event} authors={authors} />
    </div>
  );
}
