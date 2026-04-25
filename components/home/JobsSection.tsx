// components/home/JobsSection.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useJobs } from "@/hooks/useJobs";

const CATEGORY_ICONS: Record<string, string> = {
  TECH: "💻",
  MARKETING: "📣",
  DESIGN: "🎨",
  CUSTOMER_SERVICE: "🎧",
  WRITING: "✍️",
  FINANCE: "💰",
  EDUCATION: "📚",
  HEALTH: "🏥",
  OTHER: "🌐",
};

export default function JobsSection() {
  const { categories, categoriesLoading } = useJobs();

  return (
    <section className="py-16 relative">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2
              className="text-2xl font-extrabold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              Find Remote Jobs
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Search for remote work opportunities across the World.
            </p>
          </div>
          <Button asChild size="sm" variant="scarlet">
            <Link href="/jobs">Browse All Jobs</Link>
          </Button>
        </div>

        {/* Categories Grid */}
        {categoriesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl animate-pulse"
                style={{ background: "var(--bg-muted, #f3f4f6)" }}
              />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories
              .filter((c) => c.active)
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((cat) => (
                <Link
                  key={cat.id}
                  href={`/jobs?category=${cat.slug}`}
                  className="group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                  style={{
                    borderColor: "var(--border-subtle, #e5e7eb)",
                    background: "var(--bg-card, #fff)",
                  }}
                >
                  <span className="text-xl">
                    {cat.icon || CATEGORY_ICONS[cat.name] || "🌐"}
                  </span>
                  <div className="min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {cat.name}
                    </p>
                    {cat._count?.jobs !== undefined && (
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {cat._count.jobs} job{cat._count.jobs !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                  {cat.color && (
                    <span
                      className="ml-auto w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: cat.color }}
                    />
                  )}
                </Link>
              ))}
          </div>
        ) : (
          /* Fallback: Coming Soon */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <h3
                className="text-3xl font-bold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Coming Soon
              </h3>
              <p
                className="text-lg mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Remote Jobs Platform
              </p>
              <p
                className="text-sm mb-6"
                style={{ color: "var(--text-muted)" }}
              >
                We're building an amazing platform to connect you with the best
                remote job opportunities worldwide.
              </p>
              <Button asChild size="sm" variant="scarlet">
                <Link href="/jobs">Learn More</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
