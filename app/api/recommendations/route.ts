import { NextResponse } from "next/server";
import { getFrequentlyBoughtTogether } from "@/lib/services/recommendations";

const DEFAULT_LIMIT = 4;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  const parsedLimit = Number(searchParams.get("limit"));
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : DEFAULT_LIMIT;

  const products = await getFrequentlyBoughtTogether(productId, limit);
  return NextResponse.json(products);
}
