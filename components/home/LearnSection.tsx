"use client";

import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";

export default function LearnSection() {
  const { categories, loading: isLoading } = useCategories("course");

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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
          <h2
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Learn New Skills, Transform Your Future
          </h2>
          <p
            className="text-base max-w-xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Access quality courses designed to empower you with in-demand skills
          </p>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl animate-pulse"
                style={{
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                }}
              >
                <div className="w-11 h-11 rounded-xl bg-gray-300/20 mb-3" />
                <div className="h-3 bg-gray-300/20 rounded w-3/4 mb-2" />
                <div className="h-2 bg-gray-300/20 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Categories Grid */}
        {/* Categories Grid */}
        {!isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {categories
              .filter((cat) => cat.active)
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .slice(0, 8)
              .map((category, index) => (
                <Link
                  key={category.id}
                  href={`/learn?category=${category.slug}`}
                >
                  <div
                    className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] aspect-[4/3]"
                    style={{
                      background: category.color
                        ? `${category.color}18`
                        : "var(--glass-bg-strong)",
                      border: "1px solid var(--glass-border)",
                    }}
                  >
                    {/* Background image */}
                    {/* Background image */}
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      /* No image — show icon centered as background */
                      <div className="absolute inset-0 flex items-center justify-center">
                        {category.icon ? (
                          <span className="text-6xl opacity-40">
                            {category.icon}
                          </span>
                        ) : (
                          <BookOpen
                            className="w-16 h-16 opacity-30"
                            style={{ color: category.color ?? "var(--blue)" }}
                          />
                        )}
                      </div>
                    )}
                    {/* Dark gradient overlay */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.65) 100%)",
                      }}
                    />

                    {/* Text content — bottom of card */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                      <h3 className="text-sm font-bold leading-tight text-white mb-1">
                        {category.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs font-semibold text-white/70 group-hover:gap-2 transition-all">
                        Explore
                        <ArrowRight size={13} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && categories.length === 0 && (
          <div
            className="text-center py-12"
            style={{ color: "var(--text-muted)" }}
          >
            <p className="text-sm">No course categories found.</p>
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, var(--blue), var(--purple))",
            }}
          >
            <BookOpen className="w-5 h-5" />
            Explore All Courses
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-12"
          style={{ borderTop: "1px solid var(--divider)" }}
        >
          {[
            { value: "50+", label: "Courses Available" },
            { value: "10K+", label: "Active Learners" },
            { value: "95%", label: "Completion Rate" },
            { value: "4.8/5", label: "Average Rating" },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <div
                className="text-3xl font-bold mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                {stat.value}
              </div>
              <div
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
