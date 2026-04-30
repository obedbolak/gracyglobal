import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function moveCourseCategorySortOrder(
  id: string,
  currentOrder: number,
  requestedOrder: number,
) {
  const count = await prisma.courseCategory.count();
  const clampedOrder = Math.max(1, Math.min(requestedOrder, count));

  if (clampedOrder === currentOrder) {
    return currentOrder;
  }

  if (clampedOrder > currentOrder) {
    await prisma.courseCategory.updateMany({
      where: {
        id: { not: id },
        sortOrder: {
          gt: currentOrder,
          lte: clampedOrder,
        },
      },
      data: {
        sortOrder: { decrement: 1 },
      },
    });
  } else {
    await prisma.courseCategory.updateMany({
      where: {
        id: { not: id },
        sortOrder: {
          gte: clampedOrder,
          lt: currentOrder,
        },
      },
      data: {
        sortOrder: { increment: 1 },
      },
    });
  }

  return clampedOrder;
}

async function normalizeCourseCategorySortOrdersAfterDelete(
  deletedOrder: number,
) {
  await prisma.courseCategory.updateMany({
    where: {
      sortOrder: {
        gt: deletedOrder,
      },
    },
    data: {
      sortOrder: { decrement: 1 },
    },
  });
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const category = await prisma.courseCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ category });
  } catch (error: any) {
    console.error("[GET /api/admin/course-categories/[id]]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;
    const data = await req.json();
    const category = await prisma.courseCategory.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    if (data.slug && data.slug !== category.slug) {
      const existingSlug = await prisma.courseCategory.findUnique({
        where: { slug: data.slug },
      });
      if (existingSlug) {
        return NextResponse.json(
          { error: "A category with this slug already exists" },
          { status: 400 },
        );
      }
    }

    let sortOrder = category.sortOrder;
    if (data.sortOrder != null) {
      sortOrder = await moveCourseCategorySortOrder(
        id,
        category.sortOrder,
        Number(data.sortOrder),
      );
    }

    const updated = await prisma.courseCategory.update({
      where: { id },
      data: {
        name: data.name ?? category.name,
        slug: data.slug ?? category.slug,
        icon: data.icon ?? category.icon,
        image: data.image ?? category.image,
        color: data.color ?? category.color,
        sortOrder,
        active: data.active ?? category.active,
      },
    });

    return NextResponse.json({ category: updated });
  } catch (error: any) {
    console.error("[PATCH /api/admin/course-categories/[id]]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: RouteParams) {
  return PATCH(req, context);
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;
    const category = await prisma.courseCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    if (category._count.courses > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category with ${category._count.courses} course(s). Please reassign or delete those courses first.`,
        },
        { status: 400 },
      );
    }

    await prisma.courseCategory.delete({
      where: { id },
    });

    await normalizeCourseCategorySortOrdersAfterDelete(category.sortOrder);

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("[DELETE /api/admin/course-categories/[id]]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
