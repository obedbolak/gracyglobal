// app/api/courses/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/courses/[id] — get full course detail
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    const course = await prisma.course.findUnique({
      where: { id: params.id },
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
                // Only include content/videoUrl for enrolled users or free lessons
                content: true,
                videoUrl: true,
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
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if user is enrolled
    let enrollment = null;
    if (session?.user?.id) {
      enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: params.id,
          },
        },
        include: {
          progress: true,
        },
      });
    }

    // Hide content/videoUrl for paid lessons if not enrolled
    const isEnrolled = !!enrollment;
    const isAdmin = session?.user?.role === "ADMIN";

    const sanitizedCourse = {
      ...course,
      sections: course.sections.map((section) => ({
        ...section,
        lessons: section.lessons.map((lesson) => {
          const canAccess = isAdmin || isEnrolled || lesson.isFree;
          return {
            ...lesson,
            content: canAccess ? lesson.content : null,
            videoUrl: canAccess ? lesson.videoUrl : null,
            locked: !canAccess,
          };
        }),
      })),
    };

    return NextResponse.json({ course: sanitizedCourse, enrollment });
  } catch (error) {
    console.error("[GET /api/courses/[id]]", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 },
    );
  }
}

// PATCH /api/courses/[id] — update course (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const course = await prisma.course.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json({ course });
  } catch (error) {
    console.error("[PATCH /api/courses/[id]]", error);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 },
    );
  }
}

// DELETE /api/courses/[id] — delete course (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.course.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/courses/[id]]", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 },
    );
  }
}
