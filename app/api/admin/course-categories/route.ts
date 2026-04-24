// app/api/admin/course-categories/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.courseCategory.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error("GET /api/admin/course-categories error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
