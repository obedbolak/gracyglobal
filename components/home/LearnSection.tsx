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
            <span className="text-sm font-semibold" style={{ color: "var(--blue)" }}>
              E-Learning Platform
            </span>
          </div>
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Learn New Skills, Transform Your Future
          </h2>
          <p 
            className="text-lg max-w-2xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Access quality courses designed to empower you with in-demand skills
            and knowledge
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {COURSE_CATEGORIES.map((category) => {
            const categoryCoursesCount = COURSES.filter(c => c.category === category.id).length;
            
            return (
            <Link key={category.id} href={`/learn?category=${category.id}`}>
              <div 
                className="p-6 rounded-2xl transition-all duration-300 h-full group hover:scale-105"
                style={{ 
                  background: "var(--glass-bg)", 
                  border: "1px solid var(--glass-border)"
                }}
              >
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-4 transition-transform group-hover:scale-110"
                  style={{ 
                    background: `${category.color}15`,
                    border: `2px solid ${category.color}30`
                  }}
                >
                  {category.icon}
                </div>
                <h3 
                  className="text-lg font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {category.name}
                </h3>
                <p 
                  className="text-sm mb-4 line-clamp-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {category.description}
                </p>
                <div className="flex items-center justify-between">
                  <span 
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {categoryCoursesCount} {categoryCoursesCount === 1 ? 'Course' : 'Courses'}
                  </span>
                  <ArrowRight 
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform" 
                    style={{ color: category.color }}
                  />
                </div>
              </div>
            </Link>
          )})}
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
