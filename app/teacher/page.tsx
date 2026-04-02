"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import TeacherStats from "@/components/teacher/TeacherStats";
import CourseCard from "@/components/teacher/CourseCard";
import {
  Loader2,
  PlusCircle,
  ArrowRight,
  AlertCircle,
  BookOpen,
} from "lucide-react";

interface TeacherDashboardData {
  stats: {
    totalCourses: number;
    publishedCourses: number;
    totalStudents: number;
    totalEarnings: number;
    totalLessons: number;
    completionRate: number;
  };
  recentCourses: {
    id: string;
    title: string;
    description: string;
    thumbnail: string | null;
    category: string;
    level: string;
    price: number;
    isFree: boolean;
    published: boolean;
    _count: { sections: number; enrollments: number };
    totalLessons: number;
  }[];
}

export default function TeacherDashboardPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") fetchDashboard();
  }, [status]);

  const fetchDashboard = async () => {
    try {
      // Get teacher's courses
      const res = await fetch(
        `/api/courses?teacherId=${session?.user?.id}&includeUnpublished=true`,
      );
      const json = await res.json();

      if (!json.courses) throw new Error("Failed to load courses");

      const courses = json.courses;
      const totalStudents = courses.reduce(
        (acc: number, c: any) => acc + (c._count?.enrollments || 0),
        0,
      );
      const totalLessons = courses.reduce(
        (acc: number, c: any) => acc + (c.totalLessons || 0),
        0,
      );
      const totalEarnings = courses
        .filter((c: any) => !c.isFree)
        .reduce(
          (acc: number, c: any) => acc + c.price * (c._count?.enrollments || 0),
          0,
        );

      setData({
        stats: {
          totalCourses: courses.length,
          publishedCourses: courses.filter((c: any) => c.published).length,
          totalStudents,
          totalEarnings,
          totalLessons,
          completionRate: 0, // Calculate from enrollment progress later
        },
        recentCourses: courses.slice(0, 6),
      });
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2
            className="w-8 h-8 animate-spin mx-auto mb-4"
            style={{ color: "var(--purple)" }}
          />
          <p style={{ color: "var(--text-secondary)" }}>
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: "var(--error-text)" }}
          />
          <p className="mb-4" style={{ color: "var(--error-text)" }}>
            {error}
          </p>
          <button
            onClick={fetchDashboard}
            className="px-4 py-2 text-white rounded-lg"
            style={{
              background: "linear-gradient(135deg, var(--purple), var(--blue))",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-extrabold"
            style={{ color: "var(--text-primary)" }}
          >
            Teacher Dashboard 📚
          </h1>
          <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
            Create courses, manage content, and track your students.
          </p>
        </div>
        <Link
          href="/teacher/courses/create"
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, var(--purple), var(--blue))",
            boxShadow: "0 4px 16px rgba(123,47,190,0.4)",
          }}
        >
          <PlusCircle className="w-4 h-4" /> New Course
        </Link>
      </div>

      {/* Stats */}
      <TeacherStats
        totalCourses={data.stats.totalCourses}
        publishedCourses={data.stats.publishedCourses}
        totalStudents={data.stats.totalStudents}
        totalEarnings={data.stats.totalEarnings}
        totalLessons={data.stats.totalLessons}
        completionRate={data.stats.completionRate}
      />

      {/* Recent Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Your Courses
          </h2>
          <Link
            href="/teacher/courses"
            className="flex items-center gap-1 text-sm font-semibold"
            style={{ color: "var(--purple)" }}
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {data.recentCourses.length === 0 ? (
          <div
            className="p-12 rounded-2xl text-center"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <BookOpen
              className="w-16 h-16 mx-auto mb-4"
              style={{ color: "var(--text-disabled)" }}
            />
            <p
              className="text-lg font-semibold mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              No courses yet
            </p>
            <p
              className="text-sm mb-6"
              style={{ color: "var(--text-disabled)" }}
            >
              Create your first course to start teaching.
            </p>
            <Link
              href="/teacher/courses/create"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
              style={{
                background:
                  "linear-gradient(135deg, var(--purple), var(--blue))",
                boxShadow: "0 4px 16px rgba(123,47,190,0.4)",
              }}
            >
              <PlusCircle className="w-4 h-4" /> Create Course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.recentCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
