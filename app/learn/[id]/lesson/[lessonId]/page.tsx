"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Loader2,
  Lock,
  PlayCircle,
  FileText,
  HelpCircle,
  Radio,
  BookOpen,
  RotateCcw,
} from "lucide-react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  order: number;
}

interface LessonDetail {
  id: string;
  title: string;
  type: "VIDEO" | "TEXT" | "QUIZ" | "LIVE";
  content: string | null;
  videoUrl: string | null;
  duration: number | null;
  isFree: boolean;
  section: {
    id: string;
    title: string;
    course: { id: string; title: string };
  };
  quiz: {
    id: string;
    passingScore: number;
    questions: QuizQuestion[];
  } | null;
  progress: { completed: boolean; watchedSecs: number } | null;
  navigation: {
    prev: { id: string; title: string } | null;
    next: { id: string; title: string } | null;
  };
}

interface QuizResult {
  score: number;
  passed: boolean;
  passingScore: number;
  results: {
    questionId: string;
    isCorrect: boolean;
    correctAnswer: number;
    selectedAnswer: number;
  }[];
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`${r.status}`);
    return r.json();
  });

async function completeFetcher(url: string) {
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) throw new Error("Failed to mark complete");
  return res.json();
}

async function quizFetcher(
  url: string,
  { arg }: { arg: { answers: number[] } },
) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Quiz failed");
  return data as QuizResult;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id: courseId, lessonId } = use(params);
  const router = useRouter();

  // ── Data fetching ──────────────────────────────────────────────────────
  // FIX: was `/api/courses/${courseId}/lessons/${lessonId}` — wrong path
  const { data, error, isLoading, mutate } = useSWR<{ lesson: LessonDetail }>(
    `/api/learn/${courseId}/lesson/${lessonId}`,
    fetcher,
    { revalidateOnFocus: false },
  );

  const lesson = data?.lesson ?? null;

  // ── Mark complete ──────────────────────────────────────────────────────
  // FIX: was `/api/courses/${courseId}/lessons/${lessonId}/complete`
  const { trigger: triggerComplete, isMutating: isMarking } = useSWRMutation(
    `/api/learn/${courseId}/lesson/${lessonId}/complete`,
    completeFetcher,
  );

  const handleMarkComplete = async () => {
    await triggerComplete();
    mutate(
      (prev) =>
        prev
          ? {
              lesson: {
                ...prev.lesson,
                progress: { completed: true, watchedSecs: 0 },
              },
            }
          : prev,
      { revalidate: false },
    );
  };

  // ── Quiz ───────────────────────────────────────────────────────────────
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // FIX: was `/api/courses/${courseId}/quiz?lessonId=${lessonId}`
  const { trigger: triggerQuiz, isMutating: isSubmitting } = useSWRMutation(
    `/api/learn/${courseId}/lesson/${lessonId}/quiz`,
    quizFetcher,
  );

  const handleSubmitQuiz = async () => {
    if (!lesson?.quiz) return;
    const finalAnswers = lesson.quiz.questions.map((_, i) => answers[i] ?? -1);
    const result = await triggerQuiz({ answers: finalAnswers });
    setQuizResult(result);
    if (result.passed) {
      mutate(
        (prev) =>
          prev
            ? {
                lesson: {
                  ...prev.lesson,
                  progress: { completed: true, watchedSecs: 0 },
                },
              }
            : prev,
        { revalidate: false },
      );
    }
  };

  const resetQuiz = () => {
    setAnswers([]);
    setQuizResult(null);
  };

  // ── States ─────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "var(--background)" }}
      >
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "var(--blue)" }}
        />
      </div>
    );
  }

  if (error || !lesson) {
    const isForbidden =
      error?.message?.includes("403") || error?.message?.includes("enrolled");
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "var(--background)" }}
      >
        <div className="text-center max-w-sm">
          <Lock
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: "var(--text-muted)" }}
          />
          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            {isForbidden ? "Enroll to access" : "Lesson not found"}
          </h2>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            {isForbidden
              ? "Please enroll in this course to access its lessons."
              : "This lesson could not be loaded."}
          </p>
          <Link
            href={`/learn/${courseId}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold"
            style={{ background: "var(--blue)", color: "white" }}
          >
            <BookOpen className="w-4 h-4" />
            Back to Course
          </Link>
        </div>
      </div>
    );
  }

  const { navigation, quiz, progress } = lesson;
  const isCompleted = progress?.completed ?? false;
  const allAnswered = lesson.quiz
    ? lesson.quiz.questions.every(
        (_, i) => answers[i] !== undefined && answers[i] !== null,
      )
    : false;

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen py-8"
      style={{ background: "var(--background)" }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href={`/learn/${courseId}`}
            className="inline-flex items-center gap-1.5 text-sm mb-3 transition-colors hover:opacity-80"
            style={{ color: "var(--text-muted)" }}
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Course
          </Link>
          <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>
            {lesson.section.course.title} /{" "}
            <span style={{ color: "var(--text-secondary)" }}>
              {lesson.section.title}
            </span>
          </p>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {lesson.title}
          </h1>
        </div>

        {/* Main content card */}
        <div
          className="glass rounded-2xl p-8 mb-6"
          style={{ border: "1px solid var(--glass-border)" }}
        >
          {/* ── VIDEO ── */}
          {lesson.type === "VIDEO" && (
            <>
              {lesson.videoUrl ? (
                <div className="aspect-video bg-black rounded-xl overflow-hidden mb-6">
                  <video
                    controls
                    className="w-full h-full"
                    src={lesson.videoUrl}
                    onEnded={handleMarkComplete}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div
                  className="aspect-video rounded-xl flex items-center justify-center mb-6"
                  style={{ background: "var(--glass-bg-strong)" }}
                >
                  <div className="text-center">
                    <PlayCircle
                      className="w-12 h-12 mx-auto mb-2"
                      style={{ color: "var(--text-muted)" }}
                    />
                    <p style={{ color: "var(--text-muted)" }}>
                      No video uploaded yet
                    </p>
                  </div>
                </div>
              )}
              {!isCompleted && (
                <button
                  onClick={handleMarkComplete}
                  disabled={isMarking}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all disabled:opacity-60"
                  style={{ background: "var(--purple)", color: "white" }}
                >
                  {isMarking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Mark as Complete
                </button>
              )}
            </>
          )}

          {/* ── TEXT ── */}
          {lesson.type === "TEXT" && (
            <>
              {lesson.content ? (
                <div
                  className="prose prose-invert max-w-none mb-6"
                  style={{ color: "var(--text-primary)" }}
                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                />
              ) : (
                <div
                  className="flex items-center justify-center py-16 mb-6 rounded-xl"
                  style={{ background: "var(--glass-bg-subtle)" }}
                >
                  <div className="text-center">
                    <FileText
                      className="w-10 h-10 mx-auto mb-2"
                      style={{ color: "var(--text-muted)" }}
                    />
                    <p style={{ color: "var(--text-muted)" }}>No content yet</p>
                  </div>
                </div>
              )}
              {!isCompleted && (
                <button
                  onClick={handleMarkComplete}
                  disabled={isMarking}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all disabled:opacity-60"
                  style={{ background: "var(--purple)", color: "white" }}
                >
                  {isMarking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Mark as Complete
                </button>
              )}
            </>
          )}

          {/* ── LIVE ── */}
          {lesson.type === "LIVE" && (
            <div className="text-center py-12">
              <Radio
                className="w-12 h-12 mx-auto mb-4"
                style={{ color: "var(--purple)" }}
              />
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Live Session
              </h3>
              <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
                This is a live session. Check back when it goes live.
              </p>
            </div>
          )}

          {/* ── QUIZ ── */}
          {lesson.type === "QUIZ" && quiz && (
            <div className="space-y-6">
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                style={{
                  background: "var(--badge-blue-bg)",
                  border: "1px solid var(--divider-strong)",
                  color: "var(--blue)",
                }}
              >
                <HelpCircle className="w-4 h-4" />
                Passing score: {quiz.passingScore}% · {quiz.questions.length}{" "}
                questions
              </div>

              {quiz.questions.map((question, qIdx) => {
                const result = quizResult?.results.find(
                  (r) => r.questionId === question.id,
                );
                return (
                  <div key={question.id} className="space-y-3">
                    <h3
                      className="font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {qIdx + 1}. {question.question}
                    </h3>
                    <div className="space-y-2">
                      {question.options.map((option, optIdx) => {
                        const isSelected = answers[qIdx] === optIdx;
                        const isCorrectAnswer =
                          result?.correctAnswer === optIdx;
                        const isWrongSelected =
                          quizResult && isSelected && !result?.isCorrect;

                        return (
                          <label
                            key={optIdx}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                              quizResult ? "cursor-default" : "cursor-pointer"
                            }`}
                            style={{
                              border: `1px solid ${
                                isCorrectAnswer && quizResult
                                  ? "rgb(34,197,94)"
                                  : isWrongSelected
                                    ? "var(--scarlet)"
                                    : isSelected
                                      ? "var(--purple)"
                                      : "var(--divider)"
                              }`,
                              background:
                                isCorrectAnswer && quizResult
                                  ? "rgba(34,197,94,0.1)"
                                  : isWrongSelected
                                    ? "var(--scarlet-faint)"
                                    : isSelected
                                      ? "var(--purple-faint)"
                                      : "transparent",
                            }}
                          >
                            <input
                              type="radio"
                              name={`q-${qIdx}`}
                              checked={isSelected}
                              disabled={!!quizResult}
                              onChange={() => {
                                const next = [...answers];
                                next[qIdx] = optIdx;
                                setAnswers(next);
                              }}
                              className="accent-[var(--purple)]"
                            />
                            <span style={{ color: "var(--text-primary)" }}>
                              {option}
                            </span>
                            {isCorrectAnswer && quizResult && (
                              <CheckCircle
                                className="w-4 h-4 ml-auto"
                                style={{ color: "rgb(34,197,94)" }}
                              />
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {quizResult && (
                <div
                  className="p-5 rounded-xl text-center"
                  style={{
                    background: quizResult.passed
                      ? "rgba(34,197,94,0.1)"
                      : "var(--scarlet-faint)",
                    border: `1px solid ${
                      quizResult.passed
                        ? "rgba(34,197,94,0.3)"
                        : "var(--scarlet)"
                    }`,
                  }}
                >
                  <p
                    className="text-2xl font-bold mb-1"
                    style={{
                      color: quizResult.passed
                        ? "rgb(34,197,94)"
                        : "var(--scarlet)",
                    }}
                  >
                    {quizResult.score}%
                  </p>
                  <p
                    className="font-medium"
                    style={{
                      color: quizResult.passed
                        ? "rgb(34,197,94)"
                        : "var(--scarlet)",
                    }}
                  >
                    {quizResult.passed
                      ? "Congratulations! You passed! 🎉"
                      : `Not quite — you need ${quizResult.passingScore}% to pass.`}
                  </p>
                  {!quizResult.passed && (
                    <button
                      onClick={resetQuiz}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium glass transition-colors hover:opacity-80"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Try Again
                    </button>
                  )}
                </div>
              )}

              {!quizResult && (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={!allAnswered || isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "var(--purple)", color: "white" }}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Submit Quiz
                </button>
              )}
            </div>
          )}

          {isCompleted && lesson.type !== "QUIZ" && (
            <div
              className="flex items-center justify-center gap-2 mt-4 py-3 rounded-xl font-semibold"
              style={{
                background: "rgba(34,197,94,0.1)",
                color: "rgb(34,197,94)",
              }}
            >
              <CheckCircle className="w-5 h-5" />
              Lesson Completed
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          {navigation.prev ? (
            <Link
              href={`/learn/${courseId}/lesson/${navigation.prev.id}`}
              className="flex items-center gap-2 px-4 py-3 rounded-xl glass text-sm font-medium transition-all hover:opacity-80 min-w-0 flex-1 max-w-xs"
              style={{ color: "var(--text-primary)" }}
            >
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{navigation.prev.title}</span>
            </Link>
          ) : (
            <div />
          )}

          {navigation.next ? (
            <Link
              href={`/learn/${courseId}/lesson/${navigation.next.id}`}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-80 min-w-0 flex-1 max-w-xs justify-end ml-auto"
              style={{
                background: "var(--purple)",
                color: "white",
              }}
            >
              <span className="truncate">{navigation.next.title}</span>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
