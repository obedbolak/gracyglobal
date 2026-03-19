import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { COURSES } from "@/data/courses";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  try {
    const { id, lessonId } = await params;
    const course = COURSES.find(c => c.id === id);

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    let lesson = null;
    let sectionTitle = "";

    for (const section of course.sections) {
      const foundLesson = section.lessons.find(l => l.id === lessonId);
      if (foundLesson) {
        lesson = foundLesson;
        sectionTitle = section.title;
        break;
      }
    }

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Get all lessons for navigation
    const allLessons: any[] = [];
    course.sections.forEach(section => {
      section.lessons.forEach(l => {
        allLessons.push({ ...l, sectionTitle: section.title });
      });
    });

    const currentIndex = allLessons.findIndex(l => l.id === lessonId);
    const navigation = {
      prev: currentIndex > 0 ? { id: allLessons[currentIndex - 1].id, title: allLessons[currentIndex - 1].title } : null,
      next: currentIndex < allLessons.length - 1 ? { id: allLessons[currentIndex + 1].id, title: allLessons[currentIndex + 1].title } : null,
    };

    return NextResponse.json({
      success: true,
      data: {
        ...lesson,
        content: lesson.type === "TEXT" ? "<h1>" + lesson.title + "</h1><p>This is sample lesson content. In a real application, this would contain the full lesson material.</p>" : null,
        videoUrl: lesson.type === "VIDEO" ? "https://www.youtube.com/embed/dQw4w9WgXcQ" : null,
        section: {
          id: course.sections[0].id,
          title: sectionTitle,
          course: {
            id: course.id,
            title: course.title,
          },
        },
        progress: {
          completed: false,
        },
        navigation,
      },
    });
  } catch (error) {
    console.error("Failed to fetch lesson:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lesson" },
      { status: 500 }
    );
  }
}
