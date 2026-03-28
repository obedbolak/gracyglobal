// app/api/services/featured/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "6");

    const services = await prisma.service.findMany({
      where: {
        active: true,
        featured: true,
      },
      include: {
        options: {
          where: { active: true },
          orderBy: { amount: "asc" },
          take: 3,
        },
      },
      orderBy: [{ rating: "desc" }, { reviews: "desc" }],
      take: limit,
    });

    return NextResponse.json({ services, count: services.length });
  } catch (error: any) {
    console.error("GET /api/services/featured error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
