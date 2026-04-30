import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function moveServiceCategorySortOrder(
  id: string,
  currentOrder: number,
  requestedOrder: number,
) {
  const count = await prisma.serviceCategory.count();
  const clampedOrder = Math.max(1, Math.min(requestedOrder, count));

  if (clampedOrder === currentOrder) {
    return currentOrder;
  }

  if (clampedOrder > currentOrder) {
    await prisma.serviceCategory.updateMany({
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
    await prisma.serviceCategory.updateMany({
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

async function normalizeServiceCategorySortOrdersAfterDelete(
  deletedOrder: number,
) {
  await prisma.serviceCategory.updateMany({
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
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const category = await prisma.serviceCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { services: true },
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
    console.error("[GET /api/admin/service-categories/[id]]", error);
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
    const existing = await prisma.serviceCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    if (data.slug && data.slug !== existing.slug) {
      const existingSlug = await prisma.serviceCategory.findUnique({
        where: { slug: data.slug },
      });
      if (existingSlug) {
        return NextResponse.json(
          { error: "A category with this slug already exists" },
          { status: 400 },
        );
      }
    }

    let sortOrder = existing.sortOrder;
    if (data.sortOrder != null) {
      sortOrder = await moveServiceCategorySortOrder(
        id,
        existing.sortOrder,
        Number(data.sortOrder),
      );
    }

    const category = await prisma.serviceCategory.update({
      where: { id },
      data: {
        name: data.name ?? existing.name,
        slug: data.slug ?? existing.slug,
        icon: data.icon ?? existing.icon,
        image: data.image ?? existing.image,
        color: data.color ?? existing.color,
        sortOrder,
        active: data.active ?? existing.active,
      },
    });

    return NextResponse.json({ category });
  } catch (error: any) {
    console.error("[PATCH /api/admin/service-categories/[id]]", error);
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
    const category = await prisma.serviceCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { services: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    if (category._count.services > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category with ${category._count.services} service(s). Please reassign or delete those services first.`,
        },
        { status: 400 },
      );
    }

    await prisma.serviceCategory.delete({
      where: { id },
    });

    await normalizeServiceCategorySortOrdersAfterDelete(category.sortOrder);

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("[DELETE /api/admin/service-categories/[id]]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
