"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Users,
  Search,
  ArrowRight,
  Loader2,
  GraduationCap,
  ChevronDown,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useCourses } from "@/hooks/useCourses";
import { useCurrency } from "@/hooks/useCurrency";
import { CourseLevel } from "@prisma/client";

const CATEGORIES = [
  { id: "Business", label: "Business", icon: "💼" },
  { id: "Technology", label: "Technology", icon: "💻" },
  { id: "Health & Wellness", label: "Health & Wellness", icon: "🌿" },
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

const TYPE_FILTERS = [
  { id: "all", label: "All Courses", icon: "🎓" },
  { id: "free", label: "Free", icon: "✅" },
  { id: "paid", label: "Paid", icon: "💳" },
  { id: "featured", label: "Featured", icon: "⭐" },
];

// ─── Accordion Section ────────────────────────────────────────────────────────

function AccordionSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid var(--glass-border)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-200"
        style={{ background: "var(--glass-bg)" }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.background =
            "var(--btn-ghost-bg-hover)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.background =
            "var(--glass-bg)")
        }
      >
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--text-muted)" }}
        >
          {title}
        </span>
        <ChevronDown
          size={14}
          className="transition-transform duration-200 flex-shrink-0"
          style={{
            color: "var(--text-muted)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      <div
        className="overflow-hidden transition-all duration-300"
        style={{
          maxHeight: open ? "600px" : "0px",
          opacity: open ? 1 : 0,
        }}
      >
        <div
          className="p-2"
          style={{
            background: "var(--glass-bg)",
            borderTop: "1px solid var(--glass-border)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar content ──────────────────────────────────────────────────────────

function SidebarContent({
  selectedCategory,
  courses,
  isLoading,
  onSelect,
}: {
  selectedCategory: string;
  courses: any[];
  isLoading: boolean;
  onSelect: (id: string) => void;
}) {
  const countForCategory = (catId: string) => {
    if (catId === "all") return courses.length;
    if (catId === "free") return courses.filter((c) => c.isFree).length;
    if (catId === "paid") return courses.filter((c) => !c.isFree).length;
    if (catId === "featured") return courses.filter((c) => c.featured).length;
    return courses.filter((c) => c.category === catId).length;
  };

  const renderItem = (item: { id: string; label: string; icon: string }) => {
    const isActive = selectedCategory === item.id;
    const count = countForCategory(item.id);
    return (
      <button
        key={item.id}
        onClick={() => onSelect(item.id)}
        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-left w-full"
        style={{
          background: isActive ? "var(--blue)" : "transparent",
          color: isActive ? "white" : "var(--text-secondary)",
        }}
        onMouseEnter={(e) => {
          if (!isActive)
            (e.currentTarget as HTMLElement).style.background =
              "var(--btn-ghost-bg-hover)";
        }}
        onMouseLeave={(e) => {
          if (!isActive)
            (e.currentTarget as HTMLElement).style.background = "transparent";
        }}
      >
        <span className="text-base leading-none">{item.icon}</span>
        <span className="flex-1 truncate">{item.label}</span>
        {!isLoading && count > 0 && (
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{
              background: isActive
                ? "rgba(255,255,255,0.25)"
                : "var(--glass-bg-subtle)",
              color: isActive ? "white" : "var(--text-muted)",
            }}
          >
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <AccordionSection title="Filter by type" defaultOpen={true}>
        {TYPE_FILTERS.map(renderItem)}
      </AccordionSection>
      <AccordionSection title="Categories" defaultOpen={true}>
        {CATEGORIES.map(renderItem)}
      </AccordionSection>
    </div>
  );
}

// ─── Page content ─────────────────────────────────────────────────────────────

function LearnPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { convert } = useCurrency();

  const categoryParam = searchParams.get("category") ?? "all";
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [search, setSearch] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  const isFreeFilter = selectedCategory === "free";
  const isPaidFilter = selectedCategory === "paid";
  const isFeaturedFilter = selectedCategory === "featured";
  const isRealCategory = CATEGORIES.some((c) => c.id === selectedCategory);

  const { courses, isLoading, error } = useCourses({
    ...(isRealCategory && { category: selectedCategory }),
    ...(isFeaturedFilter && { featured: true }),
  });

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
    setMobileSidebarOpen(false);
    router.push(
      category === "all"
        ? "/learn"
        : `/learn?category=${encodeURIComponent(category)}`,
    );
  };

  const getCourseDuration = (course: (typeof courses)[0]) => {
    const totalMins = course.sections
      .flatMap((s) => s.lessons)
      .reduce((acc, l) => acc + (l.duration ?? 0), 0);
    if (totalMins < 60) return `${totalMins}m`;
    return `${Math.round(totalMins / 60)}h`;
  };

  const getLessonCount = (course: (typeof courses)[0]) =>
    course.sections.reduce((acc, s) => acc + s.lessons.length, 0);

  const allSidebarItems = [...TYPE_FILTERS, ...CATEGORIES];
  const activeLabel =
    allSidebarItems.find((s) => s.id === selectedCategory)?.label ??
    selectedCategory;

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-10">
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
            className="text-4xl font-bold mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Explore All Courses
          </h1>
          <p
            className="text-lg max-w-xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Access quality courses designed to empower you with in-demand skills
          </p>
        </div>

        {/* Search + Mobile filter toggle */}
        <div className="flex gap-3 mb-8 max-w-2xl mx-auto lg:max-w-none">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none"
              style={{
                border: "1px solid var(--divider)",
                background: "var(--glass-bg)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Mobile filter button */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold flex-shrink-0 transition-all"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-secondary)",
            }}
          >
            <SlidersHorizontal size={16} />
            Filter
          </button>
        </div>

        {/* Mobile sidebar drawer overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-50 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
            style={{
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
            }}
          />
        )}

        {/* Mobile sidebar drawer */}
        <div
          className="fixed top-0 left-0 h-full z-50 lg:hidden overflow-y-auto transition-transform duration-300"
          style={{
            width: "280px",
            background: "var(--background)",
            borderRight: "1px solid var(--glass-border)",
            transform: mobileSidebarOpen
              ? "translateX(0)"
              : "translateX(-100%)",
            padding: "20px 16px",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2
              className="font-bold text-base"
              style={{ color: "var(--text-primary)" }}
            >
              Filters
            </h2>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="p-1.5 rounded-lg transition-all"
              style={{ color: "var(--text-muted)" }}
            >
              <X size={18} />
            </button>
          </div>
          <SidebarContent
            selectedCategory={selectedCategory}
            courses={courses}
            isLoading={isLoading}
            onSelect={handleCategoryChange}
          />
        </div>

        {/* Layout */}
        <div className="flex gap-7 items-start">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-24">
            <SidebarContent
              selectedCategory={selectedCategory}
              courses={courses}
              isLoading={isLoading}
              onSelect={handleCategoryChange}
            />
          </aside>

          {/* Course grid */}
          <div className="flex-1 min-w-0">
            {/* Result count */}
            {!isLoading && !error && (
              <p
                className="text-sm mb-5"
                style={{ color: "var(--text-muted)" }}
              >
                Showing{" "}
                <span
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {filtered.length}
                </span>{" "}
                {filtered.length === 1 ? "course" : "courses"}
                {selectedCategory !== "all" && (
                  <>
                    {" "}
                    in{" "}
                    <span
                      className="font-semibold"
                      style={{ color: "var(--blue)" }}
                    >
                      {activeLabel}
                    </span>
                  </>
                )}
              </p>
            )}

            {/* Loading skeletons */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl overflow-hidden animate-pulse"
                    style={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                    }}
                  >
                    <div className="h-44 bg-gray-200 dark:bg-gray-700" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
                      <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                      <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
                      <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p style={{ color: "var(--scarlet)" }}>
                  Failed to load courses. Please try again.
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <GraduationCap
                  className="w-14 h-14 mx-auto mb-4"
                  style={{ color: "var(--text-muted)" }}
                />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  No courses found
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Try adjusting your search or selecting a different category
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((course) => {
                  const cat = CATEGORIES.find(
                    (c) => c.id === course.categoryId,
                  );
                  const lessonCount = getLessonCount(course);
                  const duration = getCourseDuration(course);

                  return (
                    <Link key={course.id} href={`/learn/${course.id}`}>
                      <div
                        className="overflow-hidden rounded-2xl transition-all duration-300 h-full group hover:scale-[1.02]"
                        style={{
                          background: "var(--glass-bg)",
                          border: "1px solid var(--glass-border)",
                        }}
                      >
                        {/* Thumbnail */}
                        <div className="relative h-44 overflow-hidden">
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
                                className="w-10 h-10"
                                style={{ color: "var(--text-muted)" }}
                              />
                            </div>
                          )}
                          {course.isFree && (
                            <span
                              className="absolute top-3 right-3 text-white px-2.5 py-1 rounded-full text-[11px] font-bold"
                              style={{ background: "var(--green)" }}
                            >
                              Free
                            </span>
                          )}
                          {course.featured && (
                            <span
                              className="absolute top-3 left-3 text-white px-2.5 py-1 rounded-full text-[11px] font-bold"
                              style={{ background: "var(--purple)" }}
                            >
                              Featured
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
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
                            className="text-base font-semibold mb-1.5 line-clamp-2"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {course.title}
                          </h3>
                          <p
                            className="text-xs mb-3 line-clamp-2"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {course.description}
                          </p>

                          <div
                            className="flex items-center gap-3 text-xs mb-3"
                            style={{ color: "var(--text-muted)" }}
                          >
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {duration}
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5" />
                              {lessonCount} lessons
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              {(course as any)._count?.enrollments ?? 0}
                            </div>
                          </div>

                          <div
                            className="flex items-center justify-between pt-3"
                            style={{ borderTop: "1px solid var(--divider)" }}
                          >
                            <span
                              className="text-base font-bold"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {course.isFree ? "Free" : convert(course.price)}
                            </span>
                            <span
                              className="text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
                              style={{ color: "var(--blue)" }}
                            >
                              View Course
                              <ArrowRight className="w-3.5 h-3.5" />
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
