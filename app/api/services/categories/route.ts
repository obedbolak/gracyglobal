// app/api/services/categories/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get unique categories with service counts
    const services = await prisma.service.groupBy({
      by: ["categoryId", "group"],
      where: { active: true },
      _count: {
        id: true,
      },
    });

    // Organize by group
    const categoriesByGroup = services.reduce(
      (acc, item) => {
        if (!acc[item.group]) {
          acc[item.group] = [];
        }
        acc[item.group].push({
          category: item.categoryId,
          count: item._count.id,
        });
        return acc;
      },
      {} as Record<string, Array<{ category: string; count: number }>>,
    );

    return NextResponse.json({
      categories: categoriesByGroup,
      totalGroups: Object.keys(categoriesByGroup).length,
    });
  } catch (error: any) {
    console.error("GET /api/services/categories error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
