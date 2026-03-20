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
  Star,
  Award,
  Download
} from "lucide-react";
import { getCourseById, COURSE_CATEGORIES } from "@/data/courses";
import { useCurrency } from "@/hooks/useCurrency";

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const { convert } = useCurrency();
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const course = getCourseById(id);

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--background)" }}>
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
          <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>Course not found</h2>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all"
            style={{ background: "var(--blue)", color: "white" }}
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const category = COURSE_CATEGORIES.find(cat => cat.id === course.category);
  const totalLessons = course.sections.reduce((acc, section) => acc + section.lessons.length, 0);
  const freeLessons = course.sections.reduce((acc, section) => 
    acc + section.lessons.filter(l => l.isFree).length, 0
  );

  const handleEnroll = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    setEnrolling(true);
    try {
      const response = await fetch(`/api/learn/${id}/enroll`, {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        setIsEnrolled(true);
      }
    } catch (error) {
      console.error("Failed to enroll:", error);
    } finally {
      setEnrolling(false);
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "VIDEO": return <PlayCircle className="w-4 h-4" />;
      case "TEXT": return <FileText className="w-4 h-4" />;
      case "QUIZ": return <CheckCircle className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen py-12" style={{ background: "var(--background)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/learn"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-6 transition-all"
          style={{ 
            background: "var(--glass-bg)", 
            border: "1px solid var(--divider)",
            color: "var(--text-primary)"
          }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Courses
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <div className="relative h-96 rounded-2xl mb-6 overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${course.thumbnail})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" }} />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span 
                    className="text-sm px-3 py-1 rounded-full font-semibold"
                    style={{ background: category?.color, color: "white" }}
                  >
                    {category?.icon} {category?.name}
                  </span>
                  <span 
                    className="text-sm px-3 py-1 rounded-full font-semibold"
                    style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
                  >
                    {course.level}
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
                <h1 className="text-4xl font-bold text-white mb-2">{course.title}</h1>
                <div className="flex items-center gap-4 text-white/90">
                  {course.instructor && (
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {course.instructor}
                    </span>
                  )}
                  {course.rating && (
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4" fill="var(--yellow)" style={{ color: "var(--yellow)" }} />
                      {course.rating}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.students.toLocaleString()} students
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-6 rounded-2xl mb-6" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>About This Course</h2>
              <p className="text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>{course.description}</p>
            </div>

            {/* What You'll Learn */}
            <div className="p-6 rounded-2xl mb-6" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>What You'll Learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {course.sections.slice(0, 6).map((section, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "var(--green)" }} />
                    <span style={{ color: "var(--text-secondary)" }}>{section.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Curriculum */}
            <div className="p-6 rounded-2xl" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>Course Curriculum</h2>
              <div className="space-y-4">
                {course.sections.map((section, sectionIdx) => (
                  <div key={section.id}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                        Section {sectionIdx + 1}: {section.title}
                      </h3>
                      <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                        {section.lessons.length} lessons
                      </span>
                    </div>
                    <div className="space-y-2">
                      {section.lessons.map((lesson) => (
                        <div 
                          key={lesson.id}
                          className="flex items-center justify-between p-3 rounded-lg transition-all"
                          style={{ 
                            background: "var(--glass-bg-subtle)",
                            border: "1px solid var(--divider)"
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div style={{ color: "var(--text-muted)" }}>
                              {getLessonIcon(lesson.type)}
                            </div>
                            <span style={{ color: "var(--text-primary)" }}>{lesson.title}</span>
                            {lesson.isFree && (
                              <span 
                                className="text-xs px-2 py-1 rounded-full font-semibold"
                                style={{ background: "var(--badge-blue-bg)", color: "var(--blue)" }}
                              >
                                Preview
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                              {lesson.duration} min
                            </span>
                            {!isEnrolled && !lesson.isFree && (
                              <Lock className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-2xl sticky top-6" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
              {/* Price */}
              <div className="text-center mb-6">
                <div className="text-5xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  {course.isFree ? "Free" : convert(course.price || 0)}
                </div>
                {!course.isFree && (
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>One-time payment, lifetime access</p>
                )}
              </div>

              {/* Enroll Button */}
              {isEnrolled ? (
                <Link
                  href={`/learn/${id}/lesson/${course.sections[0]?.lessons[0]?.id}`}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold mb-4 transition-all hover:scale-105"
                  style={{ background: "var(--green)", color: "white" }}
                >
                  <PlayCircle className="w-5 h-5" />
                  Continue Learning
                </Link>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold mb-4 transition-all hover:scale-105 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, var(--blue), var(--purple))", color: "white" }}
                >
                  {enrolling ? "Enrolling..." : course.isFree ? "Enroll for Free" : "Enroll Now"}
                </button>
              )}

              {/* Course Info */}
              <div className="space-y-4 mb-6" style={{ borderTop: "1px solid var(--divider)", paddingTop: "1.5rem" }}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                    <BookOpen className="w-4 h-4" />
                    Lessons
                  </span>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{totalLessons}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                    <Clock className="w-4 h-4" />
                    Duration
                  </span>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{Math.round(course.duration / 60)}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                    <Users className="w-4 h-4" />
                    Students
                  </span>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{course.students.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                    <Award className="w-4 h-4" />
                    Level
                  </span>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{course.level}</span>
                </div>
                {freeLessons > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                      <PlayCircle className="w-4 h-4" />
                      Free Preview
                    </span>
                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{freeLessons} lessons</span>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3" style={{ borderTop: "1px solid var(--divider)", paddingTop: "1.5rem" }}>
                <h3 className="font-semibold mb-3" style={{ color: "var(--text-primary)" }}>This course includes:</h3>
                {[
                  "Lifetime access",
                  "Certificate of completion",
                  "Mobile and desktop access",
                  "Downloadable resources"
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: "var(--green)" }} />
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{feature}</span>
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
