"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Clock, 
  Users, 
  CheckCircle,
  PlayCircle,
  FileText,
  Loader2,
  Lock,
  ChevronLeft
} from "lucide-react";

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  category: string;
  level: string;
  price?: number;
  isFree: boolean;
  duration: number;
  students: number;
  sections: {
    id: string;
    title: string;
    lessons: {
      id: string;
      title: string;
      type: string;
      duration: number;
      isFree: boolean;
    }[];
  }[];
  _count: {
    enrollments: number;
  };
  isEnrolled?: boolean;
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/learn/${id}`);
      const data = await response.json();
      if (data.success) {
        setCourse(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch course:", error);
    } finally {
      setLoading(false);
    }
  };

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
        setCourse(prev => prev ? { ...prev, isEnrolled: true } : null);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--blue)" }} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Course not found</h2>
          <Button onClick={() => router.push("/learn")}>Back to Courses</Button>
        </div>
      </div>
    );
  }

  const totalLessons = course.sections.reduce((acc, section) => acc + section.lessons.length, 0);
  const totalDuration = course.sections.reduce((acc, section) => 
    acc + section.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0), 0
  );

  return (
    <div className="min-h-screen py-12" style={{ background: "var(--background)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button 
          variant="outline" 
          onClick={() => router.push("/learn")}
          className="mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="h-96 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-6 relative overflow-hidden">
              {course.thumbnail && (
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>{course.title}</h1>
            <p className="text-lg mb-6" style={{ color: "var(--text-secondary)" }}>{course.description}</p>

            <div className="flex items-center gap-4 mb-8">
              <Badge>{course.category}</Badge>
              <Badge variant="outline">{course.level}</Badge>
              <div className="flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                <Users className="w-4 h-4" />
                {course._count.enrollments} students
              </div>
              <div className="flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                <Clock className="w-4 h-4" />
                {totalDuration} mins
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Course Curriculum</h2>
              {course.sections.map((section) => (
                <Card key={section.id} className="p-6">
                  <h3 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    {section.title}
                  </h3>
                  <div className="space-y-2">
                    {section.lessons.map((lesson) => (
                      <div 
                        key={lesson.id}
                        className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors"
                        style={{ 
                          color: "var(--text-primary)"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "var(--hover-bg)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        onClick={() => {
                          if (course.isEnrolled || lesson.isFree) {
                            router.push(`/learn/${id}/lesson/${lesson.id}`);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {getLessonIcon(lesson.type)}
                          <span>{lesson.title}</span>
                          {lesson.isFree && <Badge variant="outline">Preview</Badge>}
                        </div>
                        <div className="flex items-center gap-2">
                          {lesson.duration && (
                            <span className="text-sm" style={{ color: "var(--text-muted)" }}>{lesson.duration} min</span>
                          )}
                          {!course.isEnrolled && !lesson.isFree && (
                            <Lock className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  {course.isFree ? "Free" : `${(course.price || 0).toLocaleString()} CFA`}
                </div>
                {!course.isFree && (
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>One-time payment</p>
                )}
              </div>

              {course.isEnrolled ? (
                <Button 
                  className="w-full mb-4"
                  onClick={() => {
                    const firstLesson = course.sections[0]?.lessons[0];
                    if (firstLesson) {
                      router.push(`/learn/${id}/lesson/${firstLesson.id}`);
                    }
                  }}
                >
                  Continue Learning
                </Button>
              ) : (
                <Button 
                  className="w-full mb-4"
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    course.isFree ? "Enroll for Free" : "Enroll Now"
                  )}
                </Button>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>Total Lessons</span>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{totalLessons}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>Duration</span>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{Math.round(totalDuration / 60)}h {totalDuration % 60}m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>Level</span>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{course.level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>Students</span>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{course._count.enrollments}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
