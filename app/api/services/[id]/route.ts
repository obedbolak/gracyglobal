// app/api/services/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/roleHelpers";

// GET /api/services/:id - Get single service
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        category: true, // ✅ Include category
        options: {
          where: { active: true },
          orderBy: { amount: "asc" },
        },
        bookings: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ service });
  } catch (error: any) {
    console.error("GET /api/services/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/services/:id - Update service (admin or service owner)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    const existing = await prisma.service.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // ✅ Check if user is ADMIN or the service owner (CREATOR)
    const userRoles = Array.isArray(session.user.role)
      ? session.user.role
      : [session.user.role];

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = existing.sellerId === session.user.id;
    const isCreator = userRoles.includes("CREATOR");

    // Allow if: (1) Admin can edit any, OR (2) Creator can edit their own
    if (!isAdmin && !(isCreator && isOwner)) {
      return NextResponse.json(
        { error: "You can only edit your own services" },
        { status: 403 },
      );
    }

    const categoryId =
      data.categoryId ||
      (data.category
        ? (
            await prisma.serviceCategory.findUnique({
              where: { name: data.category },
            })
          )?.id
        : undefined);

    const service = await prisma.service.update({
      where: { id },
      data: {
        name: data.name ?? existing.name,
        description: data.description ?? existing.description,
        images: data.images ?? existing.images,
        categoryId: categoryId ?? existing.categoryId,
        group: data.group ?? existing.group,
        featured: data.featured ?? existing.featured,
        active: data.active ?? existing.active,
        badge: data.badge ?? existing.badge,
        includes: data.includes ?? existing.includes,
        availability: data.availability ?? existing.availability,
        rating: data.rating ?? existing.rating,
        reviews: data.reviews ?? existing.reviews,
      },
      include: {
        category: true, // ✅ Include category
        options: true,
      },
    });

    return NextResponse.json({ service });
  } catch (error: any) {
    console.error("PUT /api/services/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return PUT(req, { params });
}

// DELETE /api/services/:id - Delete service (admin or service owner)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.service.findUnique({
      where: { id },
      include: { _count: { select: { bookings: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // ✅ Check if user is ADMIN or the service owner (CREATOR)
    const userRoles = Array.isArray(session.user.role)
      ? session.user.role
      : [session.user.role];

    const isAdmin = userRoles.includes("ADMIN");
    const isOwner = existing.sellerId === session.user.id;
    const isCreator = userRoles.includes("CREATOR");

    // Allow if: (1) Admin can delete any, OR (2) Creator can delete their own
    if (!isAdmin && !(isCreator && isOwner)) {
      return NextResponse.json(
        { error: "You can only delete your own services" },
        { status: 403 },
      );
    }

    // Check if service has active bookings
    if (existing._count.bookings > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete service with active bookings. Deactivate instead.",
        },
        { status: 400 },
      );
    }

    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Service deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/services/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
