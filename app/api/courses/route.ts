// app/api/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/courses — list all published courses
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const level = searchParams.get("level");
    const isFree = searchParams.get("isFree");
    const featured = searchParams.get("featured");

    const courses = await prisma.course.findMany({
      where: {
        published: true,
        ...(category && { category }),
        ...(level && { level: level as any }),
        ...(isFree !== null && { isFree: isFree === "true" }),
        ...(featured !== null && { featured: featured === "true" }),
      },
      include: {
        sections: {
          include: {
            lessons: {
              select: {
                id: true,
                title: true,
                type: true,
                duration: true,
                order: true,
                isFree: true,
              },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        liveSession: true,
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("[GET /api/courses]", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 },
    );
  }
}

// POST /api/courses — create a new course (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      thumbnail,
      category,
      level,
      price,
      isFree,
      featured,
    } = body;

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        thumbnail,
        category,
        level,
        price: price ?? 0,
        isFree: isFree ?? price === 0,
        featured: featured ?? false,
        published: false,
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/courses]", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 },
    );
  }
}
