// app/api/counselors/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - List counselors (existing)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const specialty = searchParams.get("specialty");
    const available = searchParams.get("available");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");

    const counselors = await prisma.counselor.findMany({
      where: {
        ...(specialty && { specialty }),
        ...(available === "true" && { available: true }),
        ...(minPrice &&
          maxPrice && {
            pricePerHour: {
              gte: parseInt(minPrice),
              lte: parseInt(maxPrice),
            },
          }),
        ...(search && {
          user: {
            name: { contains: search, mode: "insensitive" },
          },
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            country: true,
          },
        },
      },
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ counselors, count: counselors.length });
  } catch (error: any) {
    console.error("GET /api/counselors error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create counselor (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Validate required fields
    if (!data.userId || !data.specialty || !data.pricePerHour) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if user already has a counselor profile
    const existing = await prisma.counselor.findUnique({
      where: { userId: data.userId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User already has a counselor profile" },
        { status: 400 },
      );
    }

    const counselor = await prisma.counselor.create({
      data: {
        userId: data.userId,
        bio: data.bio || "",
        specialty: data.specialty,
        pricePerHour: data.pricePerHour,
        rating: 0,
        reviews: 0,
        available: data.available ?? true,
        verified: data.verified ?? false,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json({ counselor }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/counselors error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
