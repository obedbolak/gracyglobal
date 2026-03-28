// app/api/counselors/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/counselors/:id - Get single counselor
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const counselor = await prisma.counselor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            country: true,
            phone: true,
          },
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

    if (!counselor) {
      return NextResponse.json(
        { error: "Counselor not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ counselor });
  } catch (error: any) {
    console.error("GET /api/counselors/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/counselors/:id - Update counselor (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    const counselor = await prisma.counselor.update({
      where: { id },
      data: {
        bio: data.bio,
        specialty: data.specialty,
        pricePerHour: data.pricePerHour,
        available: data.available,
        verified: data.verified,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json({ counselor });
  } catch (error: any) {
    console.error("PUT /api/counselors/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/counselors/:id - Delete counselor (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.counselor.findUnique({
      where: { id },
      include: { _count: { select: { bookings: true } } },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Counselor not found" },
        { status: 404 },
      );
    }

    // Check if counselor has active bookings
    if (existing._count.bookings > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete counselor with bookings. Deactivate them instead.",
        },
        { status: 400 },
      );
    }

    await prisma.counselor.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Counselor deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/counselors/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
