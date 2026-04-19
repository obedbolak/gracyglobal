"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import SectionsManager from "@/components/teacher/SectionsManager";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function TeacherCourseSectionsPage() {
  const params = useParams();
  const { data: session } = useSession();
  const courseId = params.id as string;

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      const json = await res.json();

      if (json.course) {
        // Verify teacher owns this course
        if (
          json.course.teacherId &&
          json.course.teacherId !== session?.user?.id
        ) {
          setError("You don't have permission to edit this course");
          return;
        }
        setCourse(json.course);
      } else {
        setError("Course not found");
      }
    } catch {
      setError("Failed to load course");
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

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center glass p-8 rounded-2xl">
          <p className="text-sm mb-4" style={{ color: "var(--error-text)" }}>
            {error || "Course not found"}
          </p>
          <Link
            href="/teacher/courses"
            className="text-sm"
            style={{ color: "var(--text-link)" }}
          >
            ← Back to courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
          Manage Content
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          {course.title} — Add sections and lessons
        </p>
      </div>

      {/* Use the teacher SectionsManager component */}
      <SectionsManager
        courseId={courseId}
        initialSections={
          course.sections?.map((s: any) => ({
            id: s.id,
            title: s.title,
            order: s.order,
            lessons:
              s.lessons?.map((l: any) => ({
                id: l.id,
                title: l.title,
                type: l.type,
                content: l.content || "",
                videoUrl: l.videoUrl || "",
                duration: l.duration || 0,
                isFree: l.isFree,
              })) || [],
          })) || []
        }
        onSectionsChange={() => {}}
      />
    </div>
  );
}
