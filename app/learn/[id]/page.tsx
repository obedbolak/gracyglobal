"use client";

import { use, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Users,
  CheckCircle,
  PlayCircle,
  FileText,
  Lock,
  ChevronLeft,
  Award,
  HelpCircle,
  Radio,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useCourse, useEnrollment, useEnroll } from "@/hooks/useCourses";
import { useCurrency } from "@/hooks/useCurrency";
import { LessonType, CourseLevel } from "@prisma/client";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: Record<string, { label: string; icon: string }> = {
  Business: { label: "Business", icon: "💼" },
  Technology: { label: "Technology", icon: "💻" },
  "Health & Wellness": { label: "Health", icon: "🌿" },
  "Personal Development": { label: "Personal Dev", icon: "🚀" },
  Finance: { label: "Finance", icon: "💰" },
  Marketing: { label: "Marketing", icon: "📣" },
  Design: { label: "Design", icon: "🎨" },
  Language: { label: "Language", icon: "🌍" },
  Parenting: { label: "Parenting", icon: "👨‍👩‍👧" },
  Career: { label: "Career", icon: "📈" },
  Other: { label: "Other", icon: "📚" },
};

const LEVEL_LABELS: Record<CourseLevel, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLessonIcon(type: LessonType) {
  switch (type) {
    case "VIDEO":
      return <PlayCircle className="w-4 h-4" />;
    case "TEXT":
      return <FileText className="w-4 h-4" />;
    case "QUIZ":
      return <HelpCircle className="w-4 h-4" />;
    case "LIVE":
      return <Radio className="w-4 h-4" />;
    default:
      return <BookOpen className="w-4 h-4" />;
  }
}

function getTotalDuration(
  sections: { lessons: { duration: number | null }[] }[],
) {
  const mins = sections
    .flatMap((s) => s.lessons)
    .reduce((acc, l) => acc + (l.duration ?? 0), 0);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const { convert } = useCurrency();

  const { course, isLoading, error } = useCourse(id);
  const { enrolled, enrollment, mutate: mutateEnrollment } = useEnrollment(id);
  const { enroll, isEnrolling, error: enrollError } = useEnroll(id);

  const [enrollFeedback, setEnrollFeedback] = useState("");

  // ── Loading ──────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "var(--background)" }}
      >
        <div className="text-center">
          <Loader2
            className="w-12 h-12 mx-auto mb-4 animate-spin"
            style={{ color: "var(--blue)" }}
          />
          <p style={{ color: "var(--text-secondary)" }}>Loading course…</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "var(--background)" }}
      >
        <div className="text-center">
          <BookOpen
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: "var(--text-muted)" }}
          />
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Course not found
          </h2>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold"
            style={{ background: "var(--blue)", color: "white" }}
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  // ── Derived values ───────────────────────────────────────────────────────

  const cat = CATEGORIES[course.category];
  const totalLessons = course.sections.reduce(
    (acc, s) => acc + s.lessons.length,
    0,
  );
  const freeLessons = course.sections.reduce(
    (acc, s) => acc + s.lessons.filter((l) => l.isFree).length,
    0,
  );
  const totalEnrolled = course.enrollments?.length ?? 0;
  const duration = getTotalDuration(course.sections);
  const firstLesson = course.sections[0]?.lessons[0];

  // ── Enroll handler ───────────────────────────────────────────────────────

  const handleEnroll = async () => {
    if (!session) {
      router.push("/login");
      return;
    }
    try {
      await enroll();
      await mutateEnrollment();
      setEnrollFeedback("You're enrolled! Start learning below.");
    } catch (e: any) {
      setEnrollFeedback(e.message ?? "Enrollment failed");
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen py-12"
      style={{ background: "var(--background)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <Link
          href="/learn"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-6 transition-all"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--divider)",
            color: "var(--text-primary)",
          }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Courses
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Main ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero thumbnail */}
            <div className="relative h-96 rounded-2xl overflow-hidden">
              {course.thumbnail ? (
                <div
                  className="absolute inset-0"
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
                    className="w-20 h-20"
                    style={{ color: "var(--text-muted)" }}
                  />
                </div>
              )}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {cat && (
                    <span
                      className="text-sm px-3 py-1 rounded-full font-semibold"
                      style={{ background: "var(--purple)", color: "white" }}
                    >
                      {cat.icon} {cat.label}
                    </span>
                  )}
                  <span
                    className="text-sm px-3 py-1 rounded-full font-semibold"
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      color: "white",
                    }}
                  >
                    {LEVEL_LABELS[course.level]}
                  </span>
                  {course.isFree && (
                    <span
                      className="text-sm px-3 py-1 rounded-full font-semibold"
                      style={{ background: "var(--green)", color: "white" }}
                    >
                      Free
                    </span>
                  )}
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {course.title}
                </h1>
                <div className="flex items-center gap-4 text-white/90 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {totalEnrolled.toLocaleString()} students
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {totalLessons} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {duration}
                  </span>
                </div>
              </div>
            </div>

            {/* About */}
            <div
              className="p-6 rounded-2xl"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
              }}
            >
              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                About This Course
              </h2>
              <p
                className="text-lg leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {course.description}
              </p>
            </div>

            {/* What you'll learn */}
            {course.sections.length > 0 && (
              <div
                className="p-6 rounded-2xl"
                style={{
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                }}
              >
                <h2
                  className="text-2xl font-bold mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  What You'll Learn
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.sections.map((section) => (
                    <div key={section.id} className="flex items-start gap-2">
                      <CheckCircle
                        className="w-5 h-5 mt-0.5 flex-shrink-0"
                        style={{ color: "var(--green)" }}
                      />
                      <span style={{ color: "var(--text-secondary)" }}>
                        {section.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum */}
            <div
              className="p-6 rounded-2xl"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
              }}
            >
              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Course Curriculum
              </h2>
              <div className="space-y-5">
                {course.sections.map((section, sIdx) => (
                  <div key={section.id}>
                    <div className="flex items-center justify-between mb-3">
                      <h3
                        className="text-lg font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Section {sIdx + 1}: {section.title}
                      </h3>
                      <span
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {section.lessons.length} lesson
                        {section.lessons.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {section.lessons.map((lesson) => {
                        const canAccess = enrolled || lesson.isFree;
                        return (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-3 rounded-lg transition-all"
                            style={{
                              background: "var(--glass-bg-subtle)",
                              border: "1px solid var(--divider)",
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <span style={{ color: "var(--text-muted)" }}>
                                {getLessonIcon(lesson.type)}
                              </span>
                              <span style={{ color: "var(--text-primary)" }}>
                                {lesson.title}
                              </span>
                              {lesson.isFree && (
                                <span
                                  className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                  style={{
                                    background: "var(--badge-blue-bg)",
                                    color: "var(--blue)",
                                  }}
                                >
                                  Preview
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              {lesson.duration && (
                                <span
                                  className="text-sm"
                                  style={{ color: "var(--text-muted)" }}
                                >
                                  {lesson.duration}m
                                </span>
                              )}
                              {canAccess ? (
                                <Link
                                  href={`/learn/${id}/lesson/${lesson.id}`}
                                  className="text-xs px-3 py-1 rounded-full font-medium transition-all hover:opacity-80"
                                  style={{
                                    background: "var(--blue)",
                                    color: "white",
                                  }}
                                >
                                  {lesson.type === "VIDEO"
                                    ? "Watch"
                                    : lesson.type === "QUIZ"
                                      ? "Take Quiz"
                                      : "Read"}
                                </Link>
                              ) : (
                                <Lock
                                  className="w-4 h-4"
                                  style={{ color: "var(--text-muted)" }}
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="lg:col-span-1">
            <div
              className="p-6 rounded-2xl sticky top-6"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
              }}
            >
              {/* Price */}
              <div className="text-center mb-6">
                <div
                  className="text-5xl font-bold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {course.isFree ? "Free" : convert(course.price)}
                </div>
                {!course.isFree && (
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    One-time payment · lifetime access
                  </p>
                )}
              </div>

              {/* Feedback */}
              {enrollFeedback && (
                <div
                  className="flex items-start gap-2 p-3 rounded-xl mb-4 text-sm"
                  style={{
                    background: enrollError
                      ? "var(--scarlet-faint)"
                      : "rgba(34,197,94,0.1)",
                    color: enrollError ? "var(--scarlet)" : "rgb(34,197,94)",
                  }}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {enrollFeedback}
                </div>
              )}

              {/* CTA */}
              {enrolled ? (
                <Link
                  href={
                    firstLesson
                      ? `/learn/${id}/lesson/${firstLesson.id}`
                      : `/learn/${id}`
                  }
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold mb-4 transition-all hover:scale-105"
                  style={{ background: "var(--green)", color: "white" }}
                >
                  <PlayCircle className="w-5 h-5" />
                  Continue Learning
                </Link>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold mb-4 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--blue), var(--purple))",
                    color: "white",
                  }}
                >
                  {isEnrolling ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enrolling…
                    </>
                  ) : course.isFree ? (
                    "Enroll for Free"
                  ) : (
                    "Enroll Now"
                  )}
                </button>
              )}

              {/* Course stats */}
              <div
                className="space-y-4 mb-6 pt-6"
                style={{ borderTop: "1px solid var(--divider)" }}
              >
                {[
                  {
                    icon: <BookOpen className="w-4 h-4" />,
                    label: "Lessons",
                    value: totalLessons,
                  },
                  {
                    icon: <Clock className="w-4 h-4" />,
                    label: "Duration",
                    value: duration,
                  },
                  {
                    icon: <Users className="w-4 h-4" />,
                    label: "Students",
                    value: totalEnrolled.toLocaleString(),
                  },
                  {
                    icon: <Award className="w-4 h-4" />,
                    label: "Level",
                    value: LEVEL_LABELS[course.level],
                  },
                  ...(freeLessons > 0
                    ? [
                        {
                          icon: <PlayCircle className="w-4 h-4" />,
                          label: "Free Preview",
                          value: `${freeLessons} lesson${freeLessons !== 1 ? "s" : ""}`,
                        },
                      ]
                    : []),
                ].map(({ icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between"
                  >
                    <span
                      className="flex items-center gap-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {icon}
                      {label}
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Includes */}
              <div
                className="space-y-3 pt-6"
                style={{ borderTop: "1px solid var(--divider)" }}
              >
                <h3
                  className="font-semibold mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  This course includes:
                </h3>
                {[
                  "Lifetime access",
                  "Certificate of completion",
                  "Mobile and desktop access",
                  "Downloadable resources",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <CheckCircle
                      className="w-4 h-4"
                      style={{ color: "var(--green)" }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
