import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CourseLevel, LessonType } from "@prisma/client";
import { hasRole } from "@/lib/roleHelpers";

// ─── GET: List courses ────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId"); // Changed from 'category'
    const level = searchParams.get("level") as CourseLevel | null;
    const featured = searchParams.get("featured");
    const teacherId = searchParams.get("teacherId"); // For teacher dashboard
    const includeUnpublished =
      searchParams.get("includeUnpublished") === "true";

    // If requesting teacher's own courses, verify auth
    if (teacherId) {
      const session = await getServerSession(authOptions);
      if (!session?.user || session.user.id !== teacherId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const courses = await prisma.course.findMany({
      where: {
        // Only show published unless requesting own courses or admin
        ...(!teacherId && !includeUnpublished && { published: true }),
        ...(teacherId && { teacherId }),
        ...(categoryId && { categoryId }), // ← FIXED: Use categoryId instead of category
        ...(level && { level }),
        ...(featured === "true" && { featured: true }),
      },
      include: {
        category: true, // ← Include the category relation
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
        _count: {
          select: {
            enrollments: true,
            sections: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate total lessons for each course
    const coursesWithStats = courses.map((course) => ({
      ...course,
      totalLessons: course.sections.reduce(
        (acc, s) => acc + s.lessons.length,
        0,
      ),
    }));

    return NextResponse.json({ courses: coursesWithStats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ─── POST: Create course with sections and lessons ────────────────────────────

interface LessonInput {
  title: string;
  type: LessonType;
  content?: string | null;
  videoUrl?: string | null;
  duration?: number | null;
  isFree?: boolean;
  order: number;
}

interface SectionInput {
  title: string;
  order: number;
  lessons?: LessonInput[];
}

interface CourseInput {
  title: string;
  description: string;
  thumbnail?: string | null;
  categoryId: string; // ← FIXED: Changed from 'category' to 'categoryId'
  level: CourseLevel;
  price?: number;
  isFree?: boolean;
  published?: boolean;
  featured?: boolean;
  sections?: SectionInput[];
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Allow ADMIN or TEACHER to create courses
    const isAdmin = hasRole(session?.user?.role, "ADMIN");
    const isTeacher = hasRole(session?.user?.role, "TEACHER");

    if (!session?.user || (!isAdmin && !isTeacher)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data: CourseInput = await req.json();

    // Validate required fields
    if (!data.title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!data.description?.trim()) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 },
      );
    }
    if (!data.categoryId?.trim()) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 },
      );
    }

    // Verify categoryId exists
    const categoryExists = await prisma.courseCategory.findUnique({
      where: { id: data.categoryId },
    });

    if (!categoryExists) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    // Create course with sections and lessons in a transaction
    const course = await prisma.$transaction(async (tx) => {
      // 1. Create the course
      const newCourse = await tx.course.create({
        data: {
          title: data.title.trim(),
          description: data.description.trim(),
          thumbnail: data.thumbnail || null,
          categoryId: data.categoryId, // ← FIXED: Use categoryId
          level: data.level || "BEGINNER",
          price: data.isFree ? 0 : data.price || 0,
          isFree: data.isFree ?? true,
          published: data.published ?? false,
          featured: data.featured ?? false,
          // Only set teacherId if created by a teacher (not admin)
          teacherId: isTeacher ? session.user.id : null,
        },
      });

      // 2. Create sections with lessons if provided
      if (data.sections && data.sections.length > 0) {
        for (const section of data.sections) {
          const newSection = await tx.courseSection.create({
            data: {
              courseId: newCourse.id,
              title: section.title.trim(),
              order: section.order,
            },
          });

          // Create lessons for this section
          if (section.lessons && section.lessons.length > 0) {
            await tx.lesson.createMany({
              data: section.lessons.map((lesson) => ({
                sectionId: newSection.id,
                title: lesson.title.trim(),
                type: lesson.type || "VIDEO",
                content: lesson.content || null,
                videoUrl: lesson.videoUrl || null,
                duration: lesson.duration || null,
                isFree: lesson.isFree ?? false,
                order: lesson.order,
              })),
            });
          }
        }
      }

      // 3. Return the complete course with all relations
      return tx.course.findUnique({
        where: { id: newCourse.id },
        include: {
          category: true, // ← Include category relation
          sections: {
            include: {
              lessons: {
                orderBy: { order: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
          teacher: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
              sections: true,
            },
          },
        },
      });
    });

    return NextResponse.json({ success: true, course }, { status: 201 });
  } catch (error: any) {
    console.error("Create course error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
