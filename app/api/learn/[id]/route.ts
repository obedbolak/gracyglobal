import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { COURSES } from "@/data/courses";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const course = COURSES.find(c => c.id === id);

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const totalLessons = course.sections.reduce((acc, section) => acc + section.lessons.length, 0);

    return NextResponse.json({
      success: true,
      data: {
        ...course,
        isEnrolled: true, // For demo purposes, all courses are accessible
        _count: {
          enrollments: course.students,
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch course:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}
