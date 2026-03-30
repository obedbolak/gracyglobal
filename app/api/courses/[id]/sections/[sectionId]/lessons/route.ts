// app/api/courses/[id]/sections/[sectionId]/lessons/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/roleHelpers";
import { LessonType } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string; sectionId: string }>;
}

// POST — create a lesson in a section
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !hasRole(session.user.role, "ADMIN"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { sectionId } = await params;
    const data = await req.json();

    const last = await prisma.lesson.findFirst({
      where: { sectionId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const lesson = await prisma.lesson.create({
      data: {
        sectionId,
        title: data.title.trim(),
        type: data.type as LessonType,
        content: data.content || null,
        videoUrl: data.videoUrl || null,
        duration: data.duration ? parseInt(data.duration) : null,
        isFree: data.isFree ?? false,
        order: (last?.order ?? 0) + 1,
      },
    });

    return NextResponse.json({ lesson }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PATCH — reorder lessons within a section
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !hasRole(session.user.role, "ADMIN"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { orderedIds } = await req.json();
    if (!Array.isArray(orderedIds))
      return NextResponse.json(
        { error: "orderedIds required" },
        { status: 400 },
      );

    await Promise.all(
      orderedIds.map((lessonId: string, index: number) =>
        prisma.lesson.update({
          where: { id: lessonId },
          data: { order: index + 1 },
        }),
      ),
    );

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
