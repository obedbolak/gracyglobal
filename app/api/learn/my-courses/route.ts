// app/api/learn/my-courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/learn/my-courses — get all courses the user is enrolled in with progress
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          include: {
            sections: {
              include: {
                lessons: { select: { id: true } },
              },
            },
            liveSession: {
              select: {
                id: true,
                title: true,
                scheduledAt: true,
                status: true,
                meetingUrl: true,
              },
            },
          },
        },
        progress: true,
      },
      orderBy: { enrolledAt: "desc" },
    });

    const coursesWithProgress = enrollments.map((enrollment) => {
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

      return {
        enrollment: {
          id: enrollment.id,
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt,
          completedAt: enrollment.completedAt,
        },
        course: enrollment.course,
        progress: {
          totalLessons,
          completedLessons,
          percentage,
        },
      };
    });

    return NextResponse.json({ courses: coursesWithProgress });
  } catch (error) {
    console.error("[GET /api/learn/my-courses]", error);
    return NextResponse.json(
      { error: "Failed to fetch enrolled courses" },
      { status: 500 },
    );
  }
}
