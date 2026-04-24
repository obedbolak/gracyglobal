// app/api/admin/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/categories/:id - Get single category
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const category = await prisma.productCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
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
    console.error("[GET /api/admin/categories/[id]]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/categories/:id - Update category
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

    // Check if category exists
    const existing = await prisma.productCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    // If slug is being changed, check if new slug already exists
    if (data.slug && data.slug !== existing.slug) {
      const existingSlug = await prisma.productCategory.findUnique({
        where: { slug: data.slug },
      });

      if (existingSlug) {
        return NextResponse.json(
          { error: "A category with this slug already exists" },
          { status: 400 },
        );
      }
    }

    // Update category
    const category = await prisma.productCategory.update({
      where: { id },
      data: {
        name: data.name ?? existing.name,
        slug: data.slug ?? existing.slug,
        icon: data.icon ?? existing.icon,
        image: data.image ?? existing.image,
        color: data.color ?? existing.color,
        sortOrder: data.sortOrder ?? existing.sortOrder,
        active: data.active ?? existing.active,
      },
    });

    return NextResponse.json({ category });
  } catch (error: any) {
    console.error("[PATCH /api/admin/categories/[id]]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Alias for PATCH
export async function PUT(req: NextRequest, { params }: RouteParams) {
  return PATCH(req, { params });
}

// DELETE /api/admin/categories/:id - Delete category
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

    // Check if category exists
    const existing = await prisma.productCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    // Prevent deletion if category has products
    if (existing._count.products > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category with ${existing._count.products} product(s). Please reassign or delete those products first.`,
        },
        { status: 400 },
      );
    }

    // Delete category
    await prisma.productCategory.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    console.error("[DELETE /api/admin/categories/[id]]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
