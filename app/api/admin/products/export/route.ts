import { requireProductAccess } from "@/lib/adminGuard";
import { prisma } from "@/lib/prisma";
import { buildBooksXml } from "@/lib/bookXml";

export async function GET() {
  const { response } = await requireProductAccess();
  if (response) return response;

  const products = await prisma.product.findMany({
    orderBy: { title: "asc" },
    include: {
      author: { select: { name: true } },
      category: { select: { nameTr: true } },
    },
  });

  const xml = buildBooksXml(products);
  const today = new Date().toISOString().slice(0, 10);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="books-${today}.xml"`,
    },
  });
}
