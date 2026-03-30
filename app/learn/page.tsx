"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Search,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useCourses } from "@/hooks/useCourses";
import { useCurrency } from "@/hooks/useCurrency";
import { CourseLevel } from "@prisma/client";

// ─── Categories (kept local — purely UI filter labels) ────────────────────────

const CATEGORIES = [
  { id: "Business", label: "Business", icon: "💼" },
  { id: "Technology", label: "Technology", icon: "💻" },
  { id: "Health & Wellness", label: "Health", icon: "🌿" },
  { id: "Personal Development", label: "Personal Dev", icon: "🚀" },
  { id: "Finance", label: "Finance", icon: "💰" },
  { id: "Marketing", label: "Marketing", icon: "📣" },
  { id: "Design", label: "Design", icon: "🎨" },
  { id: "Language", label: "Language", icon: "🌍" },
  { id: "Parenting", label: "Parenting", icon: "👨‍👩‍👧" },
  { id: "Career", label: "Career", icon: "📈" },
  { id: "Other", label: "Other", icon: "📚" },
];

const LEVEL_LABELS: Record<CourseLevel, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

// ─── Page content ─────────────────────────────────────────────────────────────

function LearnPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { convert } = useCurrency();

  const categoryParam = searchParams.get("category") ?? "all";
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  // Derive API-level filters from the selected category
  const isFreeFilter = selectedCategory === "free";
  const isPaidFilter = selectedCategory === "paid";
  const isFeaturedFilter = selectedCategory === "featured";
  const isRealCategory = CATEGORIES.some((c) => c.id === selectedCategory);

  const { courses, isLoading, error } = useCourses({
    ...(isRealCategory && { category: selectedCategory }),
    ...(isFeaturedFilter && { featured: true }),
  });

  // Client-side filtering for search + free/paid toggles
  const filtered = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase());

    const matchesFree = !isFreeFilter || course.isFree;
    const matchesPaid = !isPaidFilter || !course.isFree;

    return matchesSearch && matchesFree && matchesPaid;
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === "all") {
      router.push("/learn");
    } else {
      router.push(`/learn?category=${encodeURIComponent(category)}`);
    }
  };

  // Total duration from sections/lessons
  const getCourseDuration = (course: (typeof courses)[0]) => {
    const totalMins = course.sections
      .flatMap((s) => s.lessons)
      .reduce((acc, l) => acc + (l.duration ?? 0), 0);
    if (totalMins < 60) return `${totalMins}m`;
    return `${Math.round(totalMins / 60)}h`;
  };

  const getLessonCount = (course: (typeof courses)[0]) =>
    course.sections.reduce((acc, s) => acc + s.lessons.length, 0);

  return (
    <div
      className="min-h-screen py-12"
      style={{ background: "var(--background)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
            style={{
              background: "var(--badge-blue-bg)",
              border: "1px solid var(--divider-strong)",
            }}
          >
            <BookOpen className="w-4 h-4" style={{ color: "var(--blue)" }} />
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--blue)" }}
            >
              E-Learning Platform
            </span>
          </div>
          <h1
            className="text-4xl font-bold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Explore All Courses
          </h1>
          <p
            className="text-xl max-w-2xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Access quality courses designed to empower you with in-demand skills
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 relative max-w-2xl mx-auto">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:border-transparent"
            style={{
              border: "1px solid var(--divider)",
              background: "var(--glass-bg)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-3 justify-center">
          {[
            { id: "all", label: "All Courses", color: "var(--blue)" },
            { id: "free", label: "Free", color: "var(--green)" },
            { id: "paid", label: "Paid", color: "var(--purple)" },
          ].map(({ id, label, color }) => (
            <button
              key={id}
              onClick={() => handleCategoryChange(id)}
              className="px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                background: selectedCategory === id ? color : "var(--glass-bg)",
                color:
                  selectedCategory === id ? "white" : "var(--text-primary)",
                border: `1px solid ${selectedCategory === id ? color : "var(--divider)"}`,
              }}
            >
              {label}
            </button>
          ))}

          <div style={{ width: "1px", background: "var(--divider)" }} />

          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
              style={{
                background:
                  selectedCategory === cat.id
                    ? "var(--purple)"
                    : "var(--glass-bg)",
                color:
                  selectedCategory === cat.id ? "white" : "var(--text-primary)",
                border: `1px solid ${
                  selectedCategory === cat.id
                    ? "var(--purple)"
                    : "var(--divider)"
                }`,
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* States */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2
              className="w-8 h-8 animate-spin"
              style={{ color: "var(--blue)" }}
            />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p style={{ color: "var(--scarlet)" }}>
              Failed to load courses. Please try again.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen
              className="w-16 h-16 mx-auto mb-4"
              style={{ color: "var(--text-muted)" }}
            />
            <h3
              className="text-xl font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              No courses found
            </h3>
            <p style={{ color: "var(--text-secondary)" }}>
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course) => {
              const cat = CATEGORIES.find((c) => c.id === course.category);
              const lessonCount = getLessonCount(course);
              const duration = getCourseDuration(course);

              return (
                <Link key={course.id} href={`/learn/${course.id}`}>
                  <div
                    className="overflow-hidden rounded-2xl transition-all duration-300 h-full group hover:scale-105"
                    style={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                    }}
                  >
                    {/* Thumbnail */}
                    <div className="relative h-48 overflow-hidden">
                      {course.thumbnail ? (
                        <div
                          className="absolute inset-0 group-hover:scale-110 transition-transform duration-300"
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
                            className="w-12 h-12"
                            style={{ color: "var(--text-muted)" }}
                          />
                        </div>
                      )}
                      {course.isFree && (
                        <span
                          className="absolute top-4 right-4 text-white px-3 py-1 rounded-full text-xs font-bold"
                          style={{ background: "var(--green)" }}
                        >
                          Free
                        </span>
                      )}
                      {course.featured && (
                        <span
                          className="absolute top-4 left-4 text-white px-3 py-1 rounded-full text-xs font-bold"
                          style={{ background: "var(--purple)" }}
                        >
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        {cat && (
                          <span
                            className="text-xs px-2 py-1 rounded-full font-semibold"
                            style={{
                              background: "var(--glass-bg-subtle)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {cat.icon} {cat.label}
                          </span>
                        )}
                        <span
                          className="text-xs px-2 py-1 rounded-full font-semibold"
                          style={{
                            background: "var(--glass-bg-subtle)",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {LEVEL_LABELS[course.level]}
                        </span>
                      </div>

                      <h3
                        className="text-xl font-semibold mb-2"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {course.title}
                      </h3>
                      <p
                        className="text-sm mb-4 line-clamp-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {course.description}
                      </p>

                      <div
                        className="flex items-center justify-between text-sm mb-4"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{lessonCount} lessons</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{(course as any)._count?.enrollments ?? 0}</span>
                        </div>
                      </div>

                      <div
                        className="flex items-center justify-between pt-4"
                        style={{ borderTop: "1px solid var(--divider)" }}
                      >
                        <span
                          className="text-xl font-bold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {course.isFree ? "Free" : convert(course.price)}
                        </span>
                        <span
                          className="font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
                          style={{ color: "var(--blue)" }}
                        >
                          View Course
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex items-center justify-center min-h-screen"
          style={{ background: "var(--background)" }}
        >
          <div className="text-center">
            <BookOpen
              className="w-16 h-16 mx-auto mb-4 animate-pulse"
              style={{ color: "var(--blue)" }}
            />
            <p style={{ color: "var(--text-secondary)" }}>Loading courses...</p>
          </div>
        </div>
      }
    >
      <LearnPageContent />
    </Suspense>
  );
}
