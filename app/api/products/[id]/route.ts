// app/api/products/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) return err("Product not found", 404);
    if (!product.active) return err("This product is no longer available", 410);

    const related = await prisma.product.findMany({
      where: {
        category: product.category,
        active: true,
        stock: { gt: 0 },
        NOT: { id },
      },
      take: 4,
      orderBy: { featured: "desc" },
    });

    return ok({ ...product, related });
  } catch (e) {
    console.error("[GET /api/products/[id]]", e);
    return err("Internal server error", 500);
  }
}
