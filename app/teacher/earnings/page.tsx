"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Loader2,
  DollarSign,
  TrendingUp,
  BookOpen,
  Users,
  ArrowUpRight,
  Calendar,
} from "lucide-react";

interface CourseEarning {
  id: string;
  title: string;
  price: number;
  enrollments: number;
  revenue: number;
  isFree: boolean;
}

export default function TeacherEarningsPage() {
  const { data: session, status } = useSession();
  const [courses, setCourses] = useState<CourseEarning[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) fetchEarnings();
  }, [status, session?.user?.id]);

  const fetchEarnings = async () => {
    try {
      const res = await fetch(
        `/api/courses?teacherId=${session?.user?.id}&includeUnpublished=true`,
      );
      const json = await res.json();

      if (json.courses) {
        const mapped: CourseEarning[] = json.courses.map((c: any) => ({
          id: c.id,
          title: c.title,
          price: c.price,
          enrollments: c._count?.enrollments || 0,
          revenue: c.isFree ? 0 : c.price * (c._count?.enrollments || 0),
          isFree: c.isFree,
        }));
        setCourses(mapped);
      }
    } catch (err) {
      console.error("Failed to load earnings:", err);
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

  const totalRevenue = courses.reduce((acc, c) => acc + c.revenue, 0);
  const totalStudents = courses.reduce((acc, c) => acc + c.enrollments, 0);
  const paidCourses = courses.filter((c) => !c.isFree);
  const avgPrice =
    paidCourses.length > 0
      ? Math.round(
          paidCourses.reduce((acc, c) => acc + c.price, 0) / paidCourses.length,
        )
      : 0;

  const summaryCards = [
    {
      title: "Total Revenue",
      value: `${totalRevenue.toLocaleString()} XAF`,
      icon: DollarSign,
      color: "var(--success-text)",
      bg: "var(--success-bg)",
    },
    {
      title: "Total Students",
      value: totalStudents,
      icon: Users,
      color: "var(--blue)",
      bg: "var(--info-bg)",
    },
    {
      title: "Paid Courses",
      value: paidCourses.length,
      icon: BookOpen,
      color: "var(--purple)",
      bg: "var(--badge-purple-bg)",
    },
    {
      title: "Avg. Course Price",
      value: `${avgPrice.toLocaleString()} XAF`,
      icon: TrendingUp,
      color: "var(--warning-text)",
      bg: "var(--warning-bg)",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl font-extrabold"
          style={{ color: "var(--text-primary)" }}
        >
          Earnings
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          Track your income from course sales.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  {card.title}
                </span>
                <div className="p-2 rounded-lg" style={{ background: card.bg }}>
                  <Icon className="w-4 h-4" style={{ color: card.color }} />
                </div>
              </div>
              <p
                className="text-xl font-extrabold"
                style={{ color: "var(--text-primary)" }}
              >
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Revenue by course */}
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
          Revenue by Course
        </h3>

        {courses.length === 0 ? (
          <p
            className="text-sm text-center py-8"
            style={{ color: "var(--text-muted)" }}
          >
            No courses yet. Create one to start earning!
          </p>
        ) : (
          <div className="space-y-3">
            {courses
              .sort((a, b) => b.revenue - a.revenue)
              .map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 rounded-xl transition-all hover:scale-[1.005]"
                  style={{ background: "var(--glass-bg-subtle)" }}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {course.title}
                    </p>
                    <div
                      className="flex items-center gap-3 mt-1 text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {course.enrollments} students
                      </span>
                      <span>
                        {course.isFree
                          ? "Free"
                          : `${course.price.toLocaleString()} XAF each`}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-4">
                    <p
                      className="text-sm font-bold"
                      style={{
                        color:
                          course.revenue > 0
                            ? "var(--success-text)"
                            : "var(--text-muted)",
                      }}
                    >
                      {course.revenue > 0 && (
                        <ArrowUpRight
                          className="w-3.5 h-3.5 inline mr-0.5"
                          style={{ color: "var(--success-text)" }}
                        />
                      )}
                      {course.revenue.toLocaleString()} XAF
                    </p>
                    {course.isFree && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{
                          background: "var(--badge-neutral-bg)",
                          color: "var(--badge-neutral-text)",
                        }}
                      >
                        Free
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
