// app/admin/courses/[id]/sections/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import SectionsManager from "./_components/SectionsManager";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseSectionsPage({ params }: PageProps) {
  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      sections: {
        include: {
          lessons: {
            include: { quiz: { select: { id: true, passingScore: true } } },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
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
      <div>
        <Link
          href={`/admin/courses/${id}/edit`}
          className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to course
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Course Content
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              {course.title}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="glass px-4 py-2 rounded-xl text-center">
              <p className="text-xs text-[var(--text-muted)] mb-0.5">
                Sections
              </p>
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {course.sections.length}
              </p>
            </div>
            <div className="glass px-4 py-2 rounded-xl text-center">
              <p className="text-xs text-[var(--text-muted)] mb-0.5">Lessons</p>
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {totalLessons}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="glass p-4 rounded-xl border border-[var(--purple)]/20 flex items-start gap-3">
        <BookOpen className="w-4 h-4 text-[var(--purple)] flex-shrink-0 mt-0.5" />
        <p className="text-sm text-[var(--text-secondary)]">
          Add sections to organise your course, then add lessons inside each
          section. Hover over any lesson to edit or delete it.
        </p>
      </div>

      {/* Manager */}
      <SectionsManager courseId={id} initialSections={course.sections} />
    </div>
  );
}
