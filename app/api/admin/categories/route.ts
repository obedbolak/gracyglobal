// app/api/admin/categories/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.productCategory.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error("GET /api/admin/categories error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
