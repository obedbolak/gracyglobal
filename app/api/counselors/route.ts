// app/api/counselors/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, parsePagination } from "@/lib/api";

// ── GET /api/counselors — list counselors with filters ────────────────────────
// Query params: specialty, available, minPrice, maxPrice, page, limit, search
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const { skip, limit, page } = parsePagination(sp);

    const specialty  = sp.get("specialty");
    const available  = sp.get("available");
    const minPrice   = sp.get("minPrice") ? parseInt(sp.get("minPrice")!) : undefined;
    const maxPrice   = sp.get("maxPrice") ? parseInt(sp.get("maxPrice")!) : undefined;
    const search     = sp.get("search");

    const where: any = {};

    if (specialty) where.specialty = { has: specialty };
    if (available === "true") where.available = true;
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.pricePerHour = {
        ...(minPrice !== undefined ? { gte: minPrice } : {}),
        ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
      };
    }
    if (search) {
      where.user = {
        name: { contains: search, mode: "insensitive" },
      };
    }

    const [counselors, total] = await Promise.all([
      prisma.counselor.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
        include: {
          user: { select: { name: true, image: true, country: true } },
        },
      }),
      prisma.counselor.count({ where }),
    ]);

    return ok({
      items: counselors,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error("[GET /api/counselors]", e);
    return err("Internal server error", 500);
  }
}
