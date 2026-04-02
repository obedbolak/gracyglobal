"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Users,
  DollarSign,
  TrendingUp,
  BookOpen,
  Eye,
  Clock,
  Layers,
} from "lucide-react";

export default function TeacherCourseAnalyticsPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      const json = await res.json();
      if (json.course) setCourse(json.course);
    } catch (err) {
      console.error("Failed to load:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "var(--purple)" }}
        />
      </div>
    );
  }

  if (!course) return null;

  const totalLessons =
    course.sections?.reduce(
      (acc: number, s: any) => acc + (s.lessons?.length || 0),
      0,
    ) || 0;

  const totalDuration =
    course.sections?.reduce(
      (acc: number, s: any) =>
        acc +
        (s.lessons?.reduce((a: number, l: any) => a + (l.duration || 0), 0) ||
          0),
      0,
    ) || 0;

  const enrollmentCount =
    course.enrollments?.length || course._count?.enrollments || 0;
  const revenue = course.isFree ? 0 : course.price * enrollmentCount;

  const stats = [
    {
      title: "Total Enrollments",
      value: enrollmentCount,
      icon: Users,
      color: "var(--blue)",
      bg: "var(--info-bg)",
    },
    {
      title: "Revenue",
      value: `${revenue.toLocaleString()} XAF`,
      icon: DollarSign,
      color: "var(--success-text)",
      bg: "var(--success-bg)",
    },
    {
      title: "Sections",
      value: course.sections?.length || 0,
      icon: Layers,
      color: "var(--purple)",
      bg: "var(--badge-purple-bg)",
    },
    {
      title: "Total Lessons",
      value: totalLessons,
      icon: BookOpen,
      color: "var(--blue)",
      bg: "var(--info-bg)",
    },
    {
      title: "Total Duration",
      value: `${totalDuration} min`,
      icon: Clock,
      color: "var(--warning-text)",
      bg: "var(--warning-bg)",
    },
    {
      title: "Status",
      value: course.published ? "Published" : "Draft",
      icon: Eye,
      color: course.published ? "var(--success-text)" : "var(--text-muted)",
      bg: course.published ? "var(--success-bg)" : "var(--glass-bg-subtle)",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/teacher/courses/${courseId}`}
          className="flex items-center gap-1.5 text-sm mb-3 transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to course
        </Link>
        <h1
          className="text-2xl font-extrabold"
          style={{ color: "var(--text-primary)" }}
        >
          Analytics
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          {course.title}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl transition-all hover:scale-[1.02]"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-xs font-medium mb-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {stat.title}
                  </p>
                  <p
                    className="text-2xl font-extrabold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {stat.value}
                  </p>
                </div>
                <div
                  className="p-3 rounded-full"
                  style={{ background: stat.bg }}
                >
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content breakdown */}
      <div
        className="p-6 rounded-2xl"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
        }}
      >
        <h3
          className="text-sm font-bold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Content Breakdown
        </h3>

        <div className="space-y-3">
          {course.sections?.map((section: any, sIdx: number) => (
            <div
              key={section.id}
              className="p-4 rounded-xl"
              style={{ background: "var(--glass-bg-subtle)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-mono"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {sIdx + 1}
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {section.title}
                  </span>
                </div>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {section.lessons?.length || 0} lessons
                </span>
              </div>

              {/* Lesson type breakdown */}
              <div className="flex items-center gap-2 flex-wrap">
                {["VIDEO", "TEXT", "QUIZ", "LIVE"].map((type) => {
                  const count =
                    section.lessons?.filter((l: any) => l.type === type)
                      .length || 0;
                  if (count === 0) return null;
                  return (
                    <span
                      key={type}
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background:
                          type === "VIDEO"
                            ? "var(--blue-faint)"
                            : type === "TEXT"
                              ? "var(--purple-faint)"
                              : type === "QUIZ"
                                ? "var(--scarlet-faint)"
                                : "var(--success-bg)",
                        color:
                          type === "VIDEO"
                            ? "var(--blue)"
                            : type === "TEXT"
                              ? "var(--purple)"
                              : type === "QUIZ"
                                ? "var(--scarlet)"
                                : "var(--success-text)",
                      }}
                    >
                      {count} {type.toLowerCase()}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
