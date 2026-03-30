// app/api/courses/[id]/sections/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/roleHelpers";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/courses/[id]/sections
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const sections = await prisma.courseSection.findMany({
      where: { courseId: id },
      include: {
        lessons: {
          include: { quiz: { select: { id: true, passingScore: true } } },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ sections });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/courses/[id]/sections — create a new section
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !hasRole(session.user.role, "ADMIN"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { title } = await req.json();
    if (!title?.trim())
      return NextResponse.json({ error: "Title is required" }, { status: 400 });

    // Get current max order
    const last = await prisma.courseSection.findFirst({
      where: { courseId: id },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const section = await prisma.courseSection.create({
      data: {
        courseId: id,
        title: title.trim(),
        order: (last?.order ?? 0) + 1,
      },
      include: { lessons: true },
    });

    return NextResponse.json({ section }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PATCH /api/courses/[id]/sections — reorder sections
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !hasRole(session.user.role, "ADMIN"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { orderedIds } = await req.json(); // string[]
    if (!Array.isArray(orderedIds))
      return NextResponse.json(
        { error: "orderedIds required" },
        { status: 400 },
      );

    await Promise.all(
      orderedIds.map((sectionId: string, index: number) =>
        prisma.courseSection.update({
          where: { id: sectionId },
          data: { order: index + 1 },
        }),
      ),
    );

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
