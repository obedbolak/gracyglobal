"use client";

import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { COURSE_CATEGORIES, COURSES } from "@/data/courses";

export default function LearnSection() {
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

        {/* Categories Grid — max 8, 4 per row on large screens */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {COURSE_CATEGORIES.slice(0, 8).map((category) => {
            const categoryCoursesCount = COURSES.filter(
              (c) => c.category === category.id,
            ).length;

            return (
              <Link key={category.id} href={`/learn?category=${category.id}`}>
                <div
                  className="p-4 rounded-2xl transition-all duration-300 flex flex-col group hover:scale-[1.02]"
                  style={{
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-3 transition-transform group-hover:scale-110"
                    style={{
                      background: `${category.color}15`,
                      border: `2px solid ${category.color}30`,
                    }}
                  >
                    {category.icon}
                  </div>

                  {/* Name */}
                  <h3
                    className="text-sm font-semibold mb-1 leading-tight"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {category.name}
                  </h3>

                  {/* Course count + arrow */}
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {categoryCoursesCount}{" "}
                      {categoryCoursesCount === 1 ? "Course" : "Courses"}
                    </span>
                    <ArrowRight
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                      style={{ color: category.color }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

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
