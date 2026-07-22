// components/home/JobsSection.tsx
"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJobs } from "@/hooks/useJobs";

export default function JobsSection() {
  const { categories, categoriesLoading } = useJobs();

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{
                background: "var(--badge-blue-bg)",
                border: "1px solid var(--divider-strong)",
              }}
            >
              <span
                className="text-xs font-semibold uppercase tracking-[0.18em]"
                style={{ color: "var(--blue)" }}
              >
                Jobs
              </span>
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Find Jobs
            </h2>
            <p
              className="text-base max-w-2xl"
              style={{ color: "var(--text-secondary)" }}
            >
              Discover remote opportunities from trusted employers and apply to
              roles that fit your skills.
            </p>
          </div>

          <Button asChild size="sm" variant="default">
            <Link href="/jobs">Browse All Jobs</Link>
          </Button>
        </div>

        {categoriesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl p-5 h-28 animate-pulse"
                style={{
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                }}
              />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {categories
              .filter((c) => c.active)
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((cat) => {
                const iconBackground =
                  cat.color &&
                  cat.color.startsWith("#") &&
                  cat.color.length === 7
                    ? `${cat.color}1a`
                    : "var(--badge-blue-bg)";
                const iconBorder =
                  cat.color &&
                  cat.color.startsWith("#") &&
                  cat.color.length === 7
                    ? `${cat.color}30`
                    : "var(--divider-strong)";

                return (
                  <Link
                    key={cat.id}
                    href={`/jobs?category=${cat.slug}`}
                    className="group block rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--glass-shadow)]"
                  >
                    <div className="flex flex-col h-full">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5"
                        style={{
                          background: iconBackground,
                          border: `2px solid ${iconBorder}`,
                          color: cat.color ?? "var(--blue)",
                        }}
                      >
                        {cat.icon || "🌐"}
                      </div>

                      <div className="min-w-0">
                        <p
                          className="text-base font-semibold mb-2 truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {cat.name}
                        </p>
                        {cat._count?.jobs !== undefined && (
                          <p
                            className="text-sm mb-5"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {cat._count.jobs} job
                            {cat._count.jobs !== 1 ? "s" : ""}
                          </p>
                        )}
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        <span
                          className="text-xs font-semibold"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          View category
                        </span>
                        <ArrowRight className="w-4 h-4 text-[var(--blue)] transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        ) : (
          <div
            className="rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-12 text-center"
            style={{ boxShadow: "var(--glass-shadow)" }}
          >
            <h3
              className="text-3xl font-bold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Coming Soon
            </h3>
            <p
              className="text-base mb-4"
              style={{ color: "var(--text-secondary)" }}
            >
              Jobs are on their way. Check back soon for curated listings
              and application support.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/jobs">Learn More</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
