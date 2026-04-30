// app/admin/courses/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, BookOpen } from "lucide-react";
import EditCourseForm from "@/components/admin/Editcourseform";
import { useCategories } from "@/hooks/useCategories";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCoursePage({ params }: PageProps) {
  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      sections: {
        include: {
          lessons: {
            include: { quiz: { select: { id: true } } },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
      enrollments: {
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      },
    },
  });

  if (!course) notFound();

  const totalLessons = course.sections.reduce(
    (acc, s) => acc + s.lessons.length,
    0,
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/courses"
            className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to courses
          </Link>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Edit Course
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {course.title}
          </p>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-3">
          <div className="glass px-4 py-2 rounded-xl text-center">
            <div className="flex items-center gap-1.5 text-[var(--text-muted)] mb-0.5">
              <Users className="w-3.5 h-3.5" />
              <span className="text-xs">Enrolled</span>
            </div>
            <p className="text-lg font-bold text-[var(--text-primary)]">
              {course.enrollments.length}
            </p>
          </div>
          <div className="glass px-4 py-2 rounded-xl text-center">
            <div className="flex items-center gap-1.5 text-[var(--text-muted)] mb-0.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="text-xs">Lessons</span>
            </div>
            <p className="text-lg font-bold text-[var(--text-primary)]">
              {totalLessons}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <EditCourseForm course={course} />
    </div>
  );
}
