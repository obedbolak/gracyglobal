// app/api/jobs/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, parsePagination } from "@/lib/api";

// ── GET /api/jobs — list jobs with filters ────────────────────────────────────
// Query params: category, type, featured, search, page, limit
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const { skip, limit, page } = parsePagination(sp);

    const category = sp.get("category");
    const type     = sp.get("type");
    const featured = sp.get("featured");
    const search   = sp.get("search");

    const where: any = { active: true };

    if (category) where.category = category;
    if (type) where.type = type;
    if (featured === "true") where.featured = true;
    if (search) {
      where.OR = [
        { title:   { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        include: { _count: { select: { applications: true } } },
      }),
      prisma.job.count({ where }),
    ]);

    return ok({
      items: jobs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error("[GET /api/jobs]", e);
    return err("Internal server error", 500);
  }
}
