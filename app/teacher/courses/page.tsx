"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import CourseCard from "@/components/teacher/CourseCard";
import { Loader2, PlusCircle, Search, Filter, BookOpen } from "lucide-react";

interface TeacherCourse {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  category: { id: string; name: string } | null;
  level: string;
  price: number;
  isFree: boolean;
  published: boolean;
  _count: { sections: number; enrollments: number };
  totalLessons: number;
}

type StatusFilter = "ALL" | "PUBLISHED" | "DRAFT";

export default function TeacherCoursesPage() {
  const { data: session, status: authStatus } = useSession();
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("ALL");

  useEffect(() => {
    if (authStatus === "authenticated" && session?.user?.id) fetchCourses();
  }, [authStatus, session?.user?.id]);

  const fetchCourses = async () => {
    try {
      const res = await fetch(
        `/api/courses?teacherId=${session?.user?.id}&includeUnpublished=true`,
      );
      const json = await res.json();
      if (json.courses) setCourses(json.courses);
    } catch (err) {
      console.error("Failed to load courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "ALL" ||
      (filter === "PUBLISHED" && c.published) ||
      (filter === "DRAFT" && !c.published);
    return matchesSearch && matchesFilter;
  });

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-extrabold"
            style={{ color: "var(--text-primary)" }}
          >
            My Courses
          </h1>
          <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
            Manage all your courses and content.
          </p>
        </div>
        <Link
          href="/teacher/courses/create"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, var(--purple), var(--blue))",
            boxShadow: "0 4px 16px rgba(123,47,190,0.4)",
          }}
        >
          <PlusCircle className="w-4 h-4" /> New Course
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
          {(["ALL", "PUBLISHED", "DRAFT"] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background:
                  filter === f
                    ? "linear-gradient(135deg, var(--purple), var(--blue))"
                    : "var(--glass-bg)",
                color: filter === f ? "#fff" : "var(--text-secondary)",
                border: filter === f ? "none" : "1px solid var(--glass-border)",
              }}
            >
              {f === "ALL" ? "All" : f === "PUBLISHED" ? "Published" : "Drafts"}
            </button>
          ))}
        </div>
      </div>

      {/* Course grid */}
      {filtered.length === 0 ? (
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
            className="text-lg font-semibold mb-1"
            style={{ color: "var(--text-muted)" }}
          >
            {search || filter !== "ALL"
              ? "No courses match your filters"
              : "No courses yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
