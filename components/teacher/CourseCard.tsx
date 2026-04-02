"use client";

import Link from "next/link";
import {
  BookOpen,
  Users,
  Eye,
  EyeOff,
  Edit,
  BarChart,
  Layers,
} from "lucide-react";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail: string | null;
    category: string;
    level: string;
    price: number;
    isFree: boolean;
    published: boolean;
    _count: {
      sections: number;
      enrollments: number;
    };
    totalLessons: number;
  };
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div
      className="rounded-2xl overflow-hidden transition-all hover:scale-[1.01]"
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        boxShadow: "var(--glass-shadow)",
      }}
    >
      {/* Thumbnail */}
      <div className="relative h-40 overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, var(--purple-faint), var(--blue-faint))",
            }}
          >
            <BookOpen
              className="w-12 h-12"
              style={{ color: "var(--text-disabled)" }}
            />
          </div>
        )}
        {/* Status badge */}
        <span
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold"
          style={{
            background: course.published
              ? "var(--success-bg)"
              : "var(--warning-bg)",
            color: course.published
              ? "var(--success-text)"
              : "var(--warning-text)",
            border: `1px solid ${course.published ? "var(--success-border)" : "var(--warning-border)"}`,
          }}
        >
          {course.published ? (
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> Published
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <EyeOff className="w-3 h-3" /> Draft
            </span>
          )}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{
              background: "var(--badge-purple-bg)",
              color: "var(--badge-purple-text)",
            }}
          >
            {course.category}
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{
              background: "var(--badge-blue-bg)",
              color: "var(--badge-blue-text)",
            }}
          >
            {course.level}
          </span>
        </div>

        <h3
          className="font-bold text-sm mb-2 line-clamp-2"
          style={{ color: "var(--text-primary)" }}
        >
          {course.title}
        </h3>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center">
            <p
              className="text-lg font-extrabold"
              style={{ color: "var(--text-primary)" }}
            >
              {course._count.sections}
            </p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              Sections
            </p>
          </div>
          <div className="text-center">
            <p
              className="text-lg font-extrabold"
              style={{ color: "var(--text-primary)" }}
            >
              {course.totalLessons}
            </p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              Lessons
            </p>
          </div>
          <div className="text-center">
            <p
              className="text-lg font-extrabold"
              style={{ color: "var(--text-primary)" }}
            >
              {course._count.enrollments}
            </p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              Students
            </p>
          </div>
        </div>

        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: "1px solid var(--divider)" }}
        >
          <span
            className="text-sm font-extrabold"
            style={{ color: "var(--accent-primary)" }}
          >
            {course.isFree ? "Free" : `${course.price.toLocaleString()} XAF`}
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={`/teacher/courses/${course.id}/sections`}
              className="p-2 rounded-lg transition-colors hover:bg-[var(--sidebar-item-hover)]"
              title="Manage Content"
            >
              <Layers
                className="w-4 h-4"
                style={{ color: "var(--text-muted)" }}
              />
            </Link>
            <Link
              href={`/teacher/courses/${course.id}/students`}
              className="p-2 rounded-lg transition-colors hover:bg-[var(--sidebar-item-hover)]"
              title="Students"
            >
              <Users
                className="w-4 h-4"
                style={{ color: "var(--text-muted)" }}
              />
            </Link>
            <Link
              href={`/teacher/courses/${course.id}/analytics`}
              className="p-2 rounded-lg transition-colors hover:bg-[var(--sidebar-item-hover)]"
              title="Analytics"
            >
              <BarChart
                className="w-4 h-4"
                style={{ color: "var(--text-muted)" }}
              />
            </Link>
            <Link
              href={`/teacher/courses/${course.id}`}
              className="p-2 rounded-lg transition-colors hover:bg-[var(--sidebar-item-hover)]"
              title="Edit"
            >
              <Edit
                className="w-4 h-4"
                style={{ color: "var(--text-muted)" }}
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
