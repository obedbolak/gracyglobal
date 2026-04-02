"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Users,
  User,
  Search,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";

interface Student {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  enrolledAt: string;
  status: string;
}

export default function TeacherCourseStudentsPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      const json = await res.json();
      if (json.course) {
        setCourse(json.course);
        setStudents(json.course.enrollments || []);
      }
    } catch (err) {
      console.error("Failed to load:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter(
    (s) =>
      s.user.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.user.email.toLowerCase().includes(search.toLowerCase()),
  );

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
          Students
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          {course?.title} — {students.length} enrolled student
          {students.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: "var(--text-muted)" }}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students..."
          className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
        />
      </div>

      {/* Students list */}
      {filtered.length === 0 ? (
        <div
          className="p-12 rounded-2xl text-center"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <Users
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: "var(--text-disabled)" }}
          />
          <p
            className="text-lg font-semibold mb-1"
            style={{ color: "var(--text-muted)" }}
          >
            {search ? "No students match your search" : "No students yet"}
          </p>
          <p className="text-sm" style={{ color: "var(--text-disabled)" }}>
            Students will appear here when they enroll in your course.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((student) => (
            <div
              key={student.user.id}
              className="p-5 rounded-2xl transition-all hover:scale-[1.01]"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                {student.user.image ? (
                  <img
                    src={student.user.image}
                    alt={student.user.name || ""}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: "var(--glass-bg-subtle)" }}
                  >
                    <User
                      className="w-5 h-5"
                      style={{ color: "var(--text-muted)" }}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className="font-bold text-sm truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {student.user.name || "Unknown"}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {student.user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className="flex items-center gap-1 text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Calendar className="w-3 h-3" />
                  {new Date(student.enrolledAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{
                    background:
                      student.status === "COMPLETED"
                        ? "var(--success-bg)"
                        : "var(--info-bg)",
                    color:
                      student.status === "COMPLETED"
                        ? "var(--success-text)"
                        : "var(--info-text)",
                  }}
                >
                  {student.status === "COMPLETED" ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <Clock className="w-3 h-3" />
                  )}
                  {student.status || "Active"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
