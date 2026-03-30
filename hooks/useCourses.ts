// hooks/useCourses.ts
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { Course, CourseSection, Lesson, CourseLevel } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LessonNavItem {
  id: string;
  title: string;
}

export type LessonSummary = Pick<
  Lesson,
  "id" | "title" | "type" | "duration" | "isFree" | "order"
>;

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  order: number;
}

export interface LessonDetail {
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
    prev: LessonNavItem | null;
    next: LessonNavItem | null;
  };
}

export type SectionWithLessons = CourseSection & {
  lessons: LessonSummary[];
};

export type CourseListItem = Course & {
  sections: SectionWithLessons[];
};

export type CourseDetail = Course & {
  sections: (CourseSection & { lessons: Lesson[] })[];
  enrollments: {
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
  }[];
};

export interface CoursesFilter {
  category?: string;
  level?: CourseLevel;
  featured?: boolean;
}

// ─── Fetcher ──────────────────────────────────────────────────────────────────

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
    return res.json();
  });

// ─── Hook: list of courses ────────────────────────────────────────────────────

export function useCourses(filters: CoursesFilter = {}) {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.level) params.set("level", filters.level);
  if (filters.featured) params.set("featured", "true");

  const query = params.toString();
  const key = `/api/courses${query ? `?${query}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<{
    courses: CourseListItem[];
  }>(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000, // 1 min
  });

  return {
    courses: data?.courses ?? [],
    isLoading,
    error: error?.message ?? null,
    mutate,
  };
}

// ─── Hook: single course ──────────────────────────────────────────────────────

export function useCourse(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<{
    course: CourseDetail;
  }>(id ? `/api/courses/${id}` : null, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });

  return {
    course: data?.course ?? null,
    isLoading,
    error: error?.message ?? null,
    mutate,
  };
}

// ─── Hook: enrollment status ──────────────────────────────────────────────────

export interface EnrollmentStatus {
  enrolled: boolean;
  enrollment: {
    id: string;
    status: string;
    enrolledAt: string;
    progress: { lessonId: string; completed: boolean }[];
  } | null;
}

export function useEnrollment(courseId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<EnrollmentStatus>(
    courseId ? `/api/courses/${courseId}/enroll` : null,
    fetcher,
    { revalidateOnFocus: false },
  );

  return {
    enrolled: data?.enrolled ?? false,
    enrollment: data?.enrollment ?? null,
    isLoading,
    error: error?.message ?? null,
    mutate,
  };
}

// ─── Hook: enroll mutation ────────────────────────────────────────────────────

async function enrollFetcher(
  url: string,
  { arg }: { arg?: { paymentReference?: string } },
) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg ?? {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Enrollment failed");
  return data;
}

export function useEnroll(courseId: string) {
  const { trigger, isMutating, error } = useSWRMutation(
    `/api/courses/${courseId}/enroll`,
    enrollFetcher,
  );

  return {
    enroll: (paymentReference?: string) => trigger({ paymentReference }),
    isEnrolling: isMutating,
    error: error?.message ?? null,
  };
}

export function useSubmitQuiz(courseId: string, lessonId: string) {
  const { trigger, isMutating, data, error } = useSWRMutation(
    `/api/courses/${courseId}/quiz?lessonId=${lessonId}`,
    quizFetcher,
  );

  return {
    submitQuiz: (answers: number[]) => trigger({ answers }),
    isSubmitting: isMutating,
    result: data ?? null,
    error: error?.message ?? null,
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

// ─── Mutation: submit quiz ────────────────────────────────────────────────────

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
  if (!res.ok) throw new Error(data.error ?? "Quiz submission failed");
  return data as {
    score: number;
    passed: boolean;
    passingScore: number;
    results: {
      questionId: string;
      isCorrect: boolean;
      correctAnswer: number;
      selectedAnswer: number;
    }[];
  };
}

// ─── Hook: single lesson (for player) ────────────────────────────────────────

export function useLesson(courseId: string, lessonId: string | null) {
  // Derive sectionId isn't needed — the GET route resolves it from lessonId
  // We use a stable key that includes both IDs
  const key = lessonId ? `/api/courses/${courseId}/lessons/${lessonId}` : null;

  const { data, error, isLoading, mutate } = useSWR<{ lesson: LessonDetail }>(
    key,
    fetcher,
    { revalidateOnFocus: false },
  );

  return {
    lesson: data?.lesson ?? null,
    isLoading,
    error: error?.message ?? null,
    mutate,
  };
}

// ─── Mutation: mark lesson complete ──────────────────────────────────────────

async function completeFetcher(url: string) {
  const res = await fetch(url, { method: "POST" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to mark complete");
  return data;
}

export function useMarkComplete(courseId: string, lessonId: string) {
  const { trigger, isMutating } = useSWRMutation(
    `/api/courses/${courseId}/lessons/${lessonId}/complete`,
    completeFetcher,
  );
  return { markComplete: trigger, isMarking: isMutating };
}

// ─── Hook: course progress ────────────────────────────────────────────────────

export interface CourseProgress {
  enrollment: object;
  progress: { lessonId: string; completed: boolean; watchedSecs: number }[];
  stats: { totalLessons: number; completedLessons: number; percentage: number };
}

export function useCourseProgress(courseId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<CourseProgress>(
    courseId ? `/api/courses/${courseId}/progress` : null,
    fetcher,
    { revalidateOnFocus: true },
  );

  return {
    progress: data?.progress ?? [],
    stats: data?.stats ?? {
      totalLessons: 0,
      completedLessons: 0,
      percentage: 0,
    },
  };
}
