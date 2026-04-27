// app/admin/courses/page.tsx

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Edit,
  Trash2,
  Plus,
  Eye,
  GraduationCap,
  Users,
  Clock,
} from "lucide-react";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: true, // ← add this
      _count: {
        select: {
          enrollments: true,
          sections: true,
        },
      },
      sections: {
        include: {
          _count: {
            select: { lessons: true },
          },
        },
      },
    },
  });

  const stats = {
    total: courses.length,
    published: courses.filter((c) => c.published).length,
    draft: courses.filter((c) => !c.published).length,
    free: courses.filter((c) => c.isFree).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Courses
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Manage e-learning courses
          </p>
        </div>

        <Link
          href="/admin/courses/create"
          className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg"
        >
          <Plus className="w-5 h-5" />
          Create Course
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-muted)]">
              Total Courses
            </span>
            <GraduationCap className="w-5 h-5 text-[var(--purple)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {stats.total}
          </p>
        </div>

        <div className="glass p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-muted)]">Published</span>
            <Clock className="w-5 h-5 text-[var(--blue)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {stats.published}
          </p>
        </div>

        <div className="glass p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-muted)]">Draft</span>
            <Clock className="w-5 h-5 text-[var(--text-muted)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {stats.draft}
          </p>
        </div>

        <div className="glass p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-muted)]">Free</span>
            <GraduationCap className="w-5 h-5 text-[var(--scarlet)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {stats.free}
          </p>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const totalLessons = course.sections.reduce(
            (sum, section) => sum + section._count.lessons,
            0,
          );

          return (
            <div
              key={course.id}
              className="glass rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Thumbnail */}
              {course.thumbnail && (
                <div className="relative h-48">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  {course.featured && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-[var(--purple)] text-white text-xs font-semibold rounded-full">
                      Featured
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        course.published
                          ? "bg-green-500/90 text-white"
                          : "bg-gray-500/90 text-white"
                      }`}
                    >
                      {course.published ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] line-clamp-2 flex-1">
                      {course.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                        course.level === "BEGINNER"
                          ? "badge-blue"
                          : course.level === "INTERMEDIATE"
                            ? "badge-purple"
                            : "badge-scarlet"
                      }`}
                    >
                      {course.level}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-muted)] line-clamp-2">
                    {course.description}
                  </p>
                </div>

                {/* Meta Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-muted)]">Category</span>
                    <span className="font-medium text-[var(--text-secondary)]">
                      {course.category?.name ?? "Uncategorized"}{" "}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-muted)]">Price</span>
                    <span className="font-bold text-[var(--purple)]">
                      {course.isFree
                        ? "Free"
                        : `${course.price.toLocaleString()} XAF`}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 pt-3 border-t border-[var(--divider)] text-xs text-[var(--text-muted)]">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {course._count.enrollments} enrolled
                  </div>
                  <div className="flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    {course._count.sections} sections
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {totalLessons} lessons
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3">
                  <Link
                    href={`/learn/${course.id}`}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2 py-2 rounded-lg text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>
                  <Link
                    href={`/admin/courses/${course.id}/edit`}
                    className="flex-1 btn-primary flex items-center justify-center gap-2 py-2 rounded-lg text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                  <button className="p-2 hover:bg-[var(--error-bg)] text-[var(--error-text)] rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {courses.length === 0 && (
        <div className="glass rounded-xl p-12 text-center">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            No courses yet
          </h3>
          <p className="text-[var(--text-muted)] mb-6">
            Create your first course to get started
          </p>
          <Link
            href="/admin/courses/create"
            className="inline-flex items-center gap-2 btn-primary px-6 py-3 rounded-lg"
          >
            <Plus className="w-5 h-5" />
            Create Course
          </Link>
        </div>
      )}
    </div>
  );
}
