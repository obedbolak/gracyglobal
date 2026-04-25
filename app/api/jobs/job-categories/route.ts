// app/api/jobs/job-categories/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/roleHelpers";

// GET — public, returns all active categories
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all"); // admin: include inactive

    const session = await getServerSession(authOptions);

    //for everyone no admin so everyone can fetch

    const categories = await prisma.jobCategoryModel.findMany({
      where: all === "true" ? {} : { active: true },
      orderBy: { sortOrder: "asc" },
    });

    const jobCounts = await prisma.job.groupBy({
      by: ["jobCategoryId", "category"],
      _count: { _all: true },
    });

    const categoriesWithCount = categories.map((category) => {
      const enumValue = category.slug.toUpperCase().replace(/-/g, "_");
      const total = jobCounts
        .filter(
          (group) =>
            group.jobCategoryId === category.id || group.category === enumValue,
        )
        .reduce((sum, group) => sum + group._count._all, 0);

      return {
        ...category,
        _count: {
          jobs: total,
        },
      };
    });

    return NextResponse.json({ categories: categoriesWithCount });
  } catch (error: any) {
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
