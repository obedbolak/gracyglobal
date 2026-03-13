// app/api/products/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, parsePagination } from "@/lib/api";

// ── GET /api/products — list products ────────────────────────────────────────
// Query params: category, featured, minPrice, maxPrice, search, page, limit
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const { skip, limit, page } = parsePagination(sp);

    const category = sp.get("category");
    const featured = sp.get("featured");
    const search   = sp.get("search");
    const minPrice = sp.get("minPrice") ? parseInt(sp.get("minPrice")!) : undefined;
    const maxPrice = sp.get("maxPrice") ? parseInt(sp.get("maxPrice")!) : undefined;

    const where: any = { active: true, stock: { gt: 0 } };

    if (category) where.category = { equals: category, mode: "insensitive" };
    if (featured === "true") where.featured = true;
    if (search) {
      where.OR = [
        { name:        { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {
        ...(minPrice !== undefined ? { gte: minPrice } : {}),
        ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      }),
      prisma.product.count({ where }),
    ]);

    return ok({
      items: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error("[GET /api/products]", e);
    return err("Internal server error", 500);
  }
}
