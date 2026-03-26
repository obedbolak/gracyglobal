// app/api/courses/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CourseLevel } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const level = searchParams.get("level") as CourseLevel | null;
    const featured = searchParams.get("featured");

    const courses = await prisma.course.findMany({
      where: {
        published: true,
        ...(category && { category }),
        ...(level && { level }),
        ...(featured === "true" && { featured: true }),
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
                isFree: true,
                order: true,
              },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ courses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const course = await prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        thumbnail: data.thumbnail || null,
        category: data.category,
        level: data.level as CourseLevel,
        price: data.price || 0,
        isFree: data.isFree || false,
        published: data.published || false,
        featured: data.featured || false,
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error: any) {
    console.error("Create course error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
