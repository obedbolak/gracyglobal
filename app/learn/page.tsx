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
  ArrowRight
} from "lucide-react";
import { COURSES, COURSE_CATEGORIES } from "@/data/courses";
import { useCurrency } from "@/hooks/useCurrency";

function LearnPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const { convert } = useCurrency();
  
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const filteredCourses = COURSES.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
                         course.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
                           selectedCategory === "free" && course.isFree ||
                           selectedCategory === "paid" && !course.isFree ||
                           course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === "all") {
      router.push("/learn");
    } else {
      router.push(`/learn?category=${category}`);
    }
  };

  return (
    <div className="min-h-screen py-12" style={{ background: "var(--background)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
            style={{
              background: "var(--badge-blue-bg)",
              border: "1px solid var(--divider-strong)",
            }}
          >
            <BookOpen className="w-4 h-4" style={{ color: "var(--blue)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--blue)" }}>
              E-Learning Platform
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Explore All Courses
          </h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            Access quality courses designed to empower you with in-demand skills
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:border-transparent"
            style={{ 
              border: "1px solid var(--divider)",
              background: "var(--glass-bg)",
              color: "var(--text-primary)"
            }}
          />
        </div>

        {/* Category Filters */}
        <div className="mb-8 flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => handleCategoryChange("all")}
            className="px-4 py-2 rounded-lg font-medium transition-all"
            style={{
              background: selectedCategory === "all" ? "var(--blue)" : "var(--glass-bg)",
              color: selectedCategory === "all" ? "white" : "var(--text-primary)",
              border: `1px solid ${selectedCategory === "all" ? "var(--blue)" : "var(--divider)"}`
            }}
          >
            All Courses
          </button>
          <button
            onClick={() => handleCategoryChange("free")}
            className="px-4 py-2 rounded-lg font-medium transition-all"
            style={{
              background: selectedCategory === "free" ? "var(--green)" : "var(--glass-bg)",
              color: selectedCategory === "free" ? "white" : "var(--text-primary)",
              border: `1px solid ${selectedCategory === "free" ? "var(--green)" : "var(--divider)"}`
            }}
          >
            Free
          </button>
          <button
            onClick={() => handleCategoryChange("paid")}
            className="px-4 py-2 rounded-lg font-medium transition-all"
            style={{
              background: selectedCategory === "paid" ? "var(--purple)" : "var(--glass-bg)",
              color: selectedCategory === "paid" ? "white" : "var(--text-primary)",
              border: `1px solid ${selectedCategory === "paid" ? "var(--purple)" : "var(--divider)"}`
            }}
          >
            Paid
          </button>
          <div style={{ width: "1px", background: "var(--divider)" }} />
          {COURSE_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
              style={{
                background: selectedCategory === category.id ? category.color : "var(--glass-bg)",
                color: selectedCategory === category.id ? "white" : "var(--text-primary)",
                border: `1px solid ${selectedCategory === category.id ? category.color : "var(--divider)"}`
              }}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>No courses found</h3>
            <p style={{ color: "var(--text-secondary)" }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const category = COURSE_CATEGORIES.find(cat => cat.id === course.category);
              
              return (
              <Link key={course.id} href={`/learn/${course.id}`}>
                <div className="overflow-hidden rounded-2xl transition-all duration-300 h-full group hover:scale-105" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                  <div className="relative h-48 overflow-hidden">
                    <div
                      className="absolute inset-0 group-hover:scale-110 transition-transform duration-300"
                      style={{
                        backgroundImage: `url(${course.thumbnail})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    {course.isFree && (
                      <span 
                        className="absolute top-4 right-4 text-white px-3 py-1 rounded-full text-xs font-bold"
                        style={{ background: "var(--green)" }}
                      >
                        Free
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ background: "var(--glass-bg-subtle)", color: "var(--text-secondary)" }}>
                        {category?.icon} {category?.name}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ background: "var(--glass-bg-subtle)", color: "var(--text-secondary)" }}>
                        {course.level}
                      </span>
                    </div>
                    <h3 
                      className="text-xl font-semibold mb-2 group-hover:transition-colors"
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
                        <span>{Math.round(course.duration / 60)}h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{course.students.toLocaleString()}</span>
                      </div>
                      {course.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4" fill="var(--yellow)" style={{ color: "var(--yellow)" }} />
                          <span>{course.rating}</span>
                        </div>
                      )}
                    </div>
                    <div 
                      className="flex items-center justify-between pt-4"
                      style={{ borderTop: "1px solid var(--divider)" }}
                    >
                      <span 
                        className="text-xl font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {course.isFree ? (
                          "Free"
                        ) : (
                          <>{convert(course.price || 0)}</>
                        )}
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
            )})}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--background)" }}>
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 animate-pulse" style={{ color: "var(--blue)" }} />
          <p style={{ color: "var(--text-secondary)" }}>Loading courses...</p>
        </div>
      </div>
    }>
      <LearnPageContent />
    </Suspense>
  );
}
