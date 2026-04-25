// app/api/jobs/job-categories/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/roleHelpers";

// GET — public, returns all active categories
// GET — public, returns all active categories
export async function GET(req: NextRequest) {
  try {
    console.log("GET /api/jobs/job-categories hit");
    console.log("Prisma client keys:", Object.keys(prisma));

    const categories = await prisma.jobCategoryModel.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { jobs: true } },
      },
    });

    console.log("Categories found:", categories.length);
    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error("GET /api/jobs/job-categories error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — admin only, create new category
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !hasRole(session.user.role, "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const category = await prisma.jobCategoryModel.create({
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, "-"),
        icon: data.icon || null,
        color: data.color || null,
        description: data.description || null,
        sortOrder: data.sortOrder || 0,
        active: data.active ?? true,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
