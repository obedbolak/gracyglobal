"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  Loader2,
  Lock
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  type: string;
  content: string | null;
  videoUrl: string | null;
  duration: number | null;
  isFree: boolean;
  section: {
    id: string;
    title: string;
    course: {
      id: string;
      title: string;
    };
  };
  quiz?: {
    id: string;
    passingScore: number;
    questions: {
      id: string;
      question: string;
      options: string[];
      order: number;
    }[];
  };
  progress?: {
    completed: boolean;
  };
  navigation: {
    prev: { id: string; title: string } | null;
    next: { id: string; title: string } | null;
  };
}

export default function LessonPage({ 
  params 
}: { 
  params: Promise<{ id: string; lessonId: string }>
}) {
  const { id, lessonId } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const response = await fetch(`/api/learn/${id}/lesson/${lessonId}`);
      const data = await response.json();
      if (data.success) {
        setLesson(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch lesson:", error);
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async () => {
    try {
      await fetch(`/api/learn/${id}/lesson/${lessonId}/complete`, {
        method: "POST",
      });
      setLesson(prev => prev ? { ...prev, progress: { completed: true } } : null);
    } catch (error) {
      console.error("Failed to mark complete:", error);
    }
  };

  const submitQuiz = async () => {
    if (!lesson?.quiz) return;

    try {
      const response = await fetch(`/api/learn/${id}/lesson/${lessonId}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: quizAnswers }),
      });
      const data = await response.json();
      if (data.success) {
        setQuizScore(data.data.score);
        setQuizSubmitted(true);
        if (data.data.passed) {
          markComplete();
        }
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lesson not accessible</h2>
          <p className="text-gray-600 mb-4">Please enroll in the course to access this lesson</p>
          <Button onClick={() => router.push(`/learn/${id}`)}>
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/learn/${id}`)}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
          <div className="text-sm text-gray-600 mb-2">
            {lesson.section.course.title} / {lesson.section.title}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
        </div>

        <Card className="p-8 mb-6">
          {lesson.type === "VIDEO" && lesson.videoUrl && (
            <div className="aspect-video bg-black rounded-lg mb-6">
              <video 
                controls 
                className="w-full h-full"
                src={lesson.videoUrl}
                onEnded={markComplete}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {lesson.type === "TEXT" && lesson.content && (
            <div 
              className="prose max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          )}

          {lesson.type === "QUIZ" && lesson.quiz && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-900">
                  Passing score: {lesson.quiz.passingScore}%
                </p>
              </div>

              {lesson.quiz.questions.map((question, idx) => (
                <div key={question.id} className="space-y-3">
                  <h3 className="font-semibold text-gray-900">
                    {idx + 1}. {question.question}
                  </h3>
                  <div className="space-y-2">
                    {question.options.map((option, optIdx) => (
                      <label 
                        key={optIdx}
                        className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={optIdx}
                          checked={quizAnswers[question.id] === optIdx}
                          onChange={() => setQuizAnswers(prev => ({ ...prev, [question.id]: optIdx }))}
                          disabled={quizSubmitted}
                          className="mr-3"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {quizSubmitted && quizScore !== null && (
                <div className={`p-4 rounded-lg ${quizScore >= lesson.quiz.passingScore ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`font-semibold ${quizScore >= lesson.quiz.passingScore ? 'text-green-900' : 'text-red-900'}`}>
                    Your score: {quizScore}%
                  </p>
                  <p className={quizScore >= lesson.quiz.passingScore ? 'text-green-700' : 'text-red-700'}>
                    {quizScore >= lesson.quiz.passingScore ? 'Congratulations! You passed!' : 'Keep trying! You can retake the quiz.'}
                  </p>
                </div>
              )}

              {!quizSubmitted && (
                <Button 
                  onClick={submitQuiz}
                  disabled={Object.keys(quizAnswers).length !== lesson.quiz.questions.length}
                  className="w-full"
                >
                  Submit Quiz
                </Button>
              )}
            </div>
          )}

          {lesson.type !== "QUIZ" && !lesson.progress?.completed && (
            <Button onClick={markComplete} className="w-full">
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Complete
            </Button>
          )}

          {lesson.progress?.completed && (
            <div className="flex items-center justify-center text-green-600 font-semibold">
              <CheckCircle className="w-5 h-5 mr-2" />
              Completed
            </div>
          )}
        </Card>

        <div className="flex items-center justify-between">
          {lesson.navigation.prev ? (
            <Button 
              variant="outline"
              onClick={() => router.push(`/learn/${id}/lesson/${lesson.navigation.prev!.id}`)}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {lesson.navigation.prev.title}
            </Button>
          ) : <div />}

          {lesson.navigation.next ? (
            <Button 
              onClick={() => router.push(`/learn/${id}/lesson/${lesson.navigation.next!.id}`)}
            >
              {lesson.navigation.next.title}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}
