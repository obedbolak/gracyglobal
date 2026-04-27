// app/api/courses/[id]/sections/[sectionId]/lessons/[lessonId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/roleHelpers";
import { LessonType } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string; sectionId: string; lessonId: string }>;
}

// PUT — update a lesson
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user ||
      (!hasRole(session.user.role, "ADMIN") &&
        !hasRole(session.user.role, "TEACHER"))
    )
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { lessonId } = await params;
    const data = await req.json();

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: data.title.trim(),
        type: data.type as LessonType,
        content: data.content || null,
        videoUrl: data.videoUrl || null,
        documentUrl: data.documentUrl || null, // ← ADD
        duration: data.duration ? parseInt(data.duration) : null,
        isFree: data.isFree ?? false,
      },
    });

    return NextResponse.json({ lesson });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE — delete a lesson
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !hasRole(session.user.role, "ADMIN"))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { lessonId } = await params;
    await prisma.lesson.delete({ where: { id: lessonId } });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
