"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  PlayCircle,
  Loader2,
  GraduationCap,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface EnrolledCourse {
  enrollment: {
    id: string;
    status: string;
    enrolledAt: string;
    completedAt: string | null;
  };
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail: string | null;
    level: string;
    sections: {
      lessons: {
        id: string;
      }[];
    }[];
  };
  progress: {
    totalLessons: number;
    completedLessons: number;
    percentage: number;
  };
}

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const res = await fetch("/api/learn/my-courses");
      if (!res.ok) {
        throw new Error("Failed to fetch");
      }
      const data = await res.json();
      if (data.success) {
        setEnrollments(data.data || []);
      } else {
        setError(data.error || "Failed to load courses");
      }
    } catch (err) {
      console.error("Failed to fetch enrollments:", err);
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            My Courses
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Continue learning from where you left off
          </p>
        </div>
        <div
          className="text-center py-16 rounded-2xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <AlertCircle
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: "var(--scarlet)" }}
          />
          <h3
            className="text-xl font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Failed to load courses
          </h3>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            {error}
          </p>
          <button
            onClick={fetchEnrollments}
            className="px-6 py-3 rounded-lg text-white font-semibold"
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2
            className="w-8 h-8 animate-spin mx-auto mb-4"
            style={{ color: "var(--blue)" }}
          />
          <p style={{ color: "var(--text-secondary)" }}>Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          My Courses
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Continue learning from where you left off
        </p>
      </div>

      {enrollments.length === 0 ? (
        <div
          className="text-center py-16 rounded-2xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <GraduationCap
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: "var(--text-muted)" }}
          />
          <h3
            className="text-xl font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            No courses enrolled yet
          </h3>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            Start learning by enrolling in a course
          </p>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold"
            style={{
              background: "linear-gradient(135deg, var(--purple), var(--blue))",
            }}
          >
            Browse Courses
            <BookOpen className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((item) => {
            const { course, progress } = item;
            const totalLessons = progress.totalLessons;
            const isCompleted = progress.percentage >= 100;

            return (
              <Link key={item.enrollment.id} href={`/learn/${course.id}`}>
                <div
                  className="overflow-hidden rounded-2xl transition-all duration-300 h-full group hover:scale-105"
                  style={{
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  <div className="relative h-48 overflow-hidden">
                    {course.thumbnail ? (
                      <div
                        className="absolute inset-0 group-hover:scale-110 transition-transform duration-300"
                        style={{
                          backgroundImage: `url(${course.thumbnail})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                    ) : (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ background: "var(--glass-bg-strong)" }}
                      >
                        <BookOpen
                          className="w-12 h-12"
                          style={{ color: "var(--text-muted)" }}
                        />
                      </div>
                    )}
                    {isCompleted && (
                      <div
                        className="absolute top-4 right-4 flex items-center gap-1 text-white px-3 py-1 rounded-full text-xs font-bold"
                        style={{ background: "var(--green)" }}
                      >
                        <CheckCircle className="w-3 h-3" />
                        Completed
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3
                      className="text-xl font-semibold mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {course.title}
                    </h3>
                    <p
                      className="text-sm mb-4 line-clamp-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between text-sm mb-4">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{totalLessons} lessons</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span style={{ color: "var(--text-secondary)" }}>
                          Progress
                        </span>
                        <span
                          className="font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {progress.percentage}%
                        </span>
                      </div>
                      <div
                        className="h-2 rounded-full overflow-hidden"
                        style={{ background: "var(--glass-bg-subtle)" }}
                      >
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${progress.percentage}%`,
                            background: isCompleted
                              ? "var(--green)"
                              : "linear-gradient(90deg, var(--purple), var(--blue))",
                          }}
                        />
                      </div>
                    </div>

                    <button
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all"
                      style={{
                        background: "var(--glass-bg-subtle)",
                        color: "var(--blue)",
                        border: "1px solid var(--divider)",
                      }}
                    >
                      <PlayCircle className="w-4 h-4" />
                      {isCompleted ? "Review Course" : "Continue Learning"}
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
