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
  Phone,
  X,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { useCourse, useEnrollment, useEnroll } from "@/hooks/useCourses";
import { useCurrency } from "@/hooks/useCurrency";
import { useCategories } from "@/hooks/useCategories";
import { useCamPay } from "@/hooks/useCamPay";
import { LessonType, CourseLevel } from "@prisma/client";

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVEL_LABELS: Record<CourseLevel, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const DEFAULT_CATEGORY_ICONS: Record<string, string> = {
  Business: "💼",
  Technology: "💻",
  "Health & Wellness": "🌿",
  "Personal Development": "🚀",
  Finance: "💰",
  Marketing: "📣",
  Design: "🎨",
  Language: "🌍",
  Parenting: "👨‍👩‍👧",
  Career: "📈",
  Other: "📚",
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

const normalizePhone = (p: string) =>
  p.trim().startsWith("237") ? p.trim().slice(3) : p.trim();

// ─── Payment Modal ────────────────────────────────────────────────────────────

interface PaymentModalProps {
  courseTitle: string;
  price: number;
  courseId: string;
  onSuccess: () => void;
  onClose: () => void;
}

function CoursePaymentModal({
  courseTitle,
  price,
  courseId,
  onSuccess,
  onClose,
}: PaymentModalProps) {
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const { status, error: paymentError, pay, reset } = useCamPay();
  const { convert } = useCurrency();

  const isLoading = status === "pending" || status === "polling";
  const isSuccess = status === "success";

  const handlePay = async () => {
    if (!phone.trim()) {
      setPhoneError("Phone number is required");
      return;
    }
    setPhoneError("");

    await pay({
      amount: price,
      phone: normalizePhone(phone),
      description: `Enrollment: ${courseTitle}`,
      externalReference: `course-${courseId}-${Date.now()}`,
      onSuccess: async (transactionId: string) => {
        // Payment confirmed — now enroll
        onSuccess();
        reset();
      },
      onFailure: () => {
        // useCamPay sets its own error state
        reset();
      },
    });
  };

  return (
    <div
      className="fixed inset-0 z-[2100] flex items-center justify-center p-4"
      style={{
        background: "var(--modal-backdrop)",
        backdropFilter: "var(--modal-blur)",
      }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl max-w-md w-full overflow-hidden"
        style={{
          background: "var(--modal-bg)",
          border: "1px solid var(--modal-border)",
          boxShadow: "var(--modal-shadow)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-6 pb-4 flex items-center justify-between border-b"
          style={{ borderColor: "var(--divider)" }}
        >
          <h2
            className="text-xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Complete Enrollment
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-lg transition-all hover:opacity-80 disabled:opacity-50"
            style={{
              background: "var(--glass-bg-subtle)",
              color: "var(--text-secondary)",
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Course summary */}
          <div
            className="rounded-xl p-4"
            style={{
              background: "var(--glass-bg-subtle)",
              border: "1px solid var(--divider)",
            }}
          >
            <div className="flex justify-between mb-2">
              <span style={{ color: "var(--text-secondary)" }}>Course:</span>
              <span
                className="font-semibold text-right max-w-[60%]"
                style={{ color: "var(--text-primary)" }}
              >
                {courseTitle}
              </span>
            </div>
            <div
              className="border-t mt-3 pt-3 flex justify-between items-center"
              style={{ borderColor: "var(--divider)" }}
            >
              <span
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Amount:
              </span>
              <span
                className="text-2xl font-bold"
                style={{ color: "var(--success-text)" }}
              >
                {convert(price)}
                <span
                  className="text-sm font-normal ml-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  ({price.toLocaleString()} XAF)
                </span>
              </span>
            </div>
          </div>

          {/* Phone input */}
          <div>
            <label
              className="flex items-center gap-2 text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              <Phone className="w-4 h-4" />
              Mobile Money Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setPhoneError("");
              }}
              placeholder="e.g., 681529488"
              className="glass-input w-full px-4 py-3 text-sm rounded-xl"
              disabled={isLoading}
              style={{
                background: "var(--input-bg)",
                border: phoneError
                  ? "1px solid var(--error-border)"
                  : "1px solid var(--input-border)",
                color: "var(--text-primary)",
              }}
            />
            {phoneError && (
              <p
                className="text-xs mt-1.5 flex items-center gap-1"
                style={{ color: "var(--error-text)" }}
              >
                <AlertTriangle className="w-3 h-3" /> {phoneError}
              </p>
            )}
            <p
              className="text-xs mt-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              Format: 6XXXXXXXX — no country code, no spaces
            </p>
          </div>

          {/* Payment error */}
          {paymentError && (
            <div
              className="rounded-lg p-3 flex items-start gap-2"
              style={{
                background: "var(--error-bg)",
                border: "1px solid var(--error-border)",
              }}
            >
              <AlertTriangle
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                style={{ color: "var(--error-text)" }}
              />
              <p className="text-sm" style={{ color: "var(--error-text)" }}>
                {paymentError}
              </p>
            </div>
          )}

          {/* Success */}
          {isSuccess && (
            <div
              className="rounded-lg p-3 flex items-start gap-2"
              style={{
                background: "var(--success-bg)",
                border: "1px solid var(--success-border)",
              }}
            >
              <CheckCircle
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                style={{ color: "var(--success-text)" }}
              />
              <p className="text-sm" style={{ color: "var(--success-text)" }}>
                Payment confirmed! Activating your enrollment…
              </p>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div
              className="rounded-lg p-3 flex items-center gap-2"
              style={{
                background: "var(--info-bg)",
                border: "1px solid var(--info-border)",
              }}
            >
              <Loader2
                className="w-4 h-4 animate-spin"
                style={{ color: "var(--info-text)" }}
              />
              <p className="text-sm" style={{ color: "var(--info-text)" }}>
                {status === "pending"
                  ? "Initiating payment…"
                  : "Check your phone and enter your PIN…"}
              </p>
            </div>
          )}

          {/* Info */}
          <div
            className="rounded-lg p-3"
            style={{
              background: "var(--info-bg)",
              border: "1px solid var(--info-border)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--info-text)" }}>
              💳 <strong>Supported:</strong> MTN Mobile Money, Orange Money
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex gap-3 p-6 border-t"
          style={{
            borderColor: "var(--divider)",
            background: "var(--glass-bg-subtle)",
          }}
        >
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--divider)",
              color: "var(--text-primary)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handlePay}
            disabled={isLoading || isSuccess || !phone}
            className="flex-1 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, var(--blue), var(--purple))",
            }}
          >
            {isSuccess ? (
              <>
                <CheckCircle className="w-4 h-4" /> Done
              </>
            ) : isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Processing…
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" /> Pay {price.toLocaleString()}{" "}
                XAF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
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
  const { categories: courseCategories } = useCategories("course");

  const [enrollFeedback, setEnrollFeedback] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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
            <ChevronLeft className="w-4 h-4" /> Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  // ── Derived values ───────────────────────────────────────────────────────

  const courseCategory = course.categoryId
    ? courseCategories.find((cat) => cat.id === course.categoryId)
    : undefined;

  const categoryLabel =
    courseCategory?.name || course.categoryId || "Uncategorized";
  const categoryIcon =
    courseCategory?.icon || DEFAULT_CATEGORY_ICONS[categoryLabel] || "📚";

  const totalLessons = course.sections.reduce(
    (acc, s) => acc + s.lessons.length,
    0,
  );
  const freeLessons = course.sections.reduce(
    (acc, s) => acc + s.lessons.filter((l) => l.isFree).length,
    0,
  );
  const totalEnrolled = course.enrollments.length;
  const duration = getTotalDuration(course.sections);
  const firstLesson = course.sections[0]?.lessons[0];

  // ── Enroll handler ───────────────────────────────────────────────────────

  const handleEnroll = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    // Paid course → show payment modal first
    if (!course.isFree && course.price > 0) {
      setShowPaymentModal(true);
      return;
    }

    // Free course → enroll directly
    try {
      await enroll();
      await mutateEnrollment();
      setEnrollFeedback("You're enrolled! Start learning below.");
    } catch (e: any) {
      setEnrollFeedback(e.message ?? "Enrollment failed");
    }
  };

  // Called by modal after payment is confirmed by CamPay
  const handlePaymentSuccess = async () => {
    try {
      await enroll();
      await mutateEnrollment();
      setShowPaymentModal(false);
      setEnrollFeedback("Payment confirmed! You're enrolled.");
    } catch (e: any) {
      setEnrollFeedback(
        "Payment successful but enrollment failed. Please contact support.",
      );
      setShowPaymentModal(false);
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
          <ChevronLeft className="w-4 h-4" /> Back to Courses
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
                  {categoryLabel && (
                    <span
                      className="text-sm px-3 py-1 rounded-full font-semibold"
                      style={{ background: "var(--purple)", color: "white" }}
                    >
                      {categoryIcon} {categoryLabel}
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
                            className="flex items-center justify-between p-3 rounded-lg"
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
                  <PlayCircle className="w-5 h-5" /> Continue Learning
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
                      <Loader2 className="w-5 h-5 animate-spin" /> Enrolling…
                    </>
                  ) : course.isFree ? (
                    "Enroll for Free"
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" /> Enroll —{" "}
                      {convert(course.price)}
                    </>
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

      {/* Payment Modal — only shown for paid courses */}
      {showPaymentModal && course && (
        <CoursePaymentModal
          courseTitle={course.title}
          price={course.price}
          courseId={id}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}
