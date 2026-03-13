// app/api/products/[id]/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/api";

// ── GET /api/products/[id] ────────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) return err("Product not found", 404);
    if (!product.active) return err("This product is no longer available", 410);

    // Fetch related products in the same category
    const related = await prisma.product.findMany({
      where: {
        category: product.category,
        active: true,
        stock: { gt: 0 },
        NOT: { id: product.id },
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
