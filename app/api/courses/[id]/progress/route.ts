// app/api/courses/[id]/progress/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/courses/[id]/progress — get full progress for this course
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: id,
        },
      },
      include: {
        progress: {
          include: {
            lesson: {
              select: { id: true, title: true, type: true, order: true },
            },
          },
        },
        course: {
          include: {
            sections: {
              include: {
                lessons: { select: { id: true } },
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
    }

    // Calculate overall completion percentage
    const totalLessons = enrollment.course.sections.flatMap(
      (s) => s.lessons,
    ).length;
    const completedLessons = enrollment.progress.filter(
      (p) => p.completed,
    ).length;
    const percentage =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    return NextResponse.json({
      enrollment,
      progress: enrollment.progress,
      stats: {
        totalLessons,
        completedLessons,
        percentage,
      },
    });
  } catch (error) {
    console.error("[GET /api/courses/[id]/progress]", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 },
    );
  }
}

// POST /api/courses/[id]/progress — mark a lesson as complete or update watch time
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonId, completed, watchedSecs } = await req.json();

    if (!lessonId) {
      return NextResponse.json(
        { error: "lessonId is required" },
        { status: 400 },
      );
    }

    // Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: id,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
    }

    // Upsert lesson progress
    const progress = await prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId,
        },
      },
      update: {
        ...(completed !== undefined && { completed }),
        ...(completed && { completedAt: new Date() }),
        ...(watchedSecs !== undefined && { watchedSecs }),
      },
      create: {
        enrollmentId: enrollment.id,
        lessonId,
        completed: completed ?? false,
        completedAt: completed ? new Date() : null,
        watchedSecs: watchedSecs ?? 0,
      },
    });

    // Check if entire course is now complete
    const allLessons = await prisma.lesson.findMany({
      where: {
        section: { courseId: id },
      },
      select: { id: true },
    });

    const allProgress = await prisma.lessonProgress.findMany({
      where: {
        enrollmentId: enrollment.id,
        completed: true,
      },
    });

    if (allProgress.length === allLessons.length) {
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("[POST /api/courses/[id]/progress]", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 },
    );
  }
}
