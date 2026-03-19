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
  Lock
} from "lucide-react";

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  category: string;
  level: string;
  price: number;
  isFree: boolean;
  sections: {
    id: string;
    title: string;
    order: number;
    lessons: {
      id: string;
      title: string;
      type: string;
      duration: number | null;
      isFree: boolean;
      order: number;
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
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

            <h1 className="text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>
            <p className="text-lg text-gray-600 mb-6">{course.description}</p>

            <div className="flex items-center gap-4 mb-8">
              <Badge>{course.category}</Badge>
              <Badge variant="outline">{course.level}</Badge>
              <div className="flex items-center gap-1 text-gray-600">
                <Users className="w-4 h-4" />
                {course._count.enrollments} students
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="w-4 h-4" />
                {totalDuration} mins
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Course Curriculum</h2>
              {course.sections.map((section) => (
                <Card key={section.id} className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {section.title}
                  </h3>
                  <div className="space-y-2">
                    {section.lessons.map((lesson) => (
                      <div 
                        key={lesson.id}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => {
                          if (course.isEnrolled || lesson.isFree) {
                            router.push(`/learn/${id}/lesson/${lesson.id}`);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {getLessonIcon(lesson.type)}
                          <span className="text-gray-900">{lesson.title}</span>
                          {lesson.isFree && <Badge variant="outline">Preview</Badge>}
                        </div>
                        <div className="flex items-center gap-2">
                          {lesson.duration && (
                            <span className="text-sm text-gray-500">{lesson.duration} min</span>
                          )}
                          {!course.isEnrolled && !lesson.isFree && (
                            <Lock className="w-4 h-4 text-gray-400" />
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
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {course.isFree ? "Free" : `${course.price.toLocaleString()} CFA`}
                </div>
                {!course.isFree && (
                  <p className="text-sm text-gray-600">One-time payment</p>
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
                  <span className="text-gray-600">Total Lessons</span>
                  <span className="font-semibold">{totalLessons}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold">{Math.round(totalDuration / 60)}h {totalDuration % 60}m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Level</span>
                  <span className="font-semibold">{course.level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Students</span>
                  <span className="font-semibold">{course._count.enrollments}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
