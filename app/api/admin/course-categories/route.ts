// app/api/admin/course-categories/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getCourseCategoryNextSortOrder() {
  const lastCategory = await prisma.courseCategory.findFirst({
    orderBy: { sortOrder: "desc" },
  });

  return lastCategory ? lastCategory.sortOrder + 1 : 1;
}

async function shiftCourseCategorySortOrdersOnCreate(order: number) {
  await prisma.courseCategory.updateMany({
    where: {
      sortOrder: { gte: order },
    },
    data: {
      sortOrder: { increment: 1 },
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all");

    const categories = await prisma.courseCategory.findMany({
      where: all === "true" ? {} : { active: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error("[GET /api/admin/course-categories]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRoles = Array.isArray(session.user.role)
      ? session.user.role
      : [session.user.role];

    if (!userRoles.includes("ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await req.json();
    if (!data.name || !data.slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 },
      );
    }

    const existingSlug = await prisma.courseCategory.findUnique({
      where: { slug: data.slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 400 },
      );
    }

    const nextSortOrder = await getCourseCategoryNextSortOrder();
    const requestedSortOrder = Number(data.sortOrder);
    const sortOrder =
      requestedSortOrder >= 1 && requestedSortOrder < nextSortOrder
        ? requestedSortOrder
        : nextSortOrder;

    if (sortOrder < nextSortOrder) {
      await shiftCourseCategorySortOrdersOnCreate(sortOrder);
    }

    const category = await prisma.courseCategory.create({
      data: {
        name: data.name,
        slug: data.slug,
        icon: data.icon || null,
        image: data.image || null,
        color: data.color || null,
        sortOrder,
        active: data.active ?? true,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/admin/course-categories]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
