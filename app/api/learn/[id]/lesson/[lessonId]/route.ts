// app/api/learn/[id]/lesson/[lessonId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/roleHelpers";
import { LessonType } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string; lessonId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: courseId, lessonId } = await params;
    const session = await getServerSession(authOptions);

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: { select: { id: true, title: true } },
          },
        },
        quiz: {
          include: {
            questions: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                question: true,
                options: true,
                order: true,
                // answer intentionally excluded from GET
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Verify the lesson actually belongs to the requested course
    if (lesson.section.course.id !== courseId) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Free preview lessons are public; others need enrollment
    if (!lesson.isFree) {
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const isAdmin = hasRole(session.user.role, "ADMIN");

      if (!isAdmin) {
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: session.user.id,
              courseId,
            },
          },
        });
        if (!enrollment) {
          return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
        }
      }
    }

    // Get all lessons in the course ordered for prev/next navigation
    const allLessons = await prisma.lesson.findMany({
      where: { section: { courseId } },
      orderBy: [{ section: { order: "asc" } }, { order: "asc" }],
      select: { id: true, title: true },
    });

    const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
    const prev = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const next =
      currentIndex < allLessons.length - 1
        ? allLessons[currentIndex + 1]
        : null;

    // Get progress if logged in and enrolled
    let progress = null;
    if (session?.user?.id) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: { userId: session.user.id, courseId },
        },
      });
      if (enrollment) {
        progress = await prisma.lessonProgress.findUnique({
          where: {
            enrollmentId_lessonId: {
              enrollmentId: enrollment.id,
              lessonId,
            },
          },
          select: { completed: true, watchedSecs: true },
        });
      }
    }

    return NextResponse.json({
      lesson: {
        ...lesson,
        progress,
        navigation: { prev, next },
      },
    });
  } catch (e: any) {
    console.error("[GET lesson]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

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
        documentUrl: data.documentUrl || null, // ← CORRECT
        duration: data.duration ? parseInt(data.duration) : null,
        isFree: data.isFree ?? false,
      },
    });

    return NextResponse.json({ lesson });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user ||
      (!hasRole(session.user.role, "ADMIN") &&
        !hasRole(session.user.role, "TEACHER"))
    )
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { lessonId } = await params;
    await prisma.lesson.delete({ where: { id: lessonId } });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
