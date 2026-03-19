"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Users, ArrowRight } from "lucide-react";

const FEATURED_COURSES = [
  {
    id: "1",
    title: "Introduction to Web Development",
    description: "Learn HTML, CSS, and JavaScript from scratch",
    category: "Technology",
    level: "Beginner",
    duration: 240,
    students: 1250,
    isFree: true,
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop",
  },
  {
    id: "2",
    title: "Digital Marketing Essentials",
    description: "Master social media, SEO, and content marketing",
    category: "Marketing",
    level: "Intermediate",
    duration: 180,
    students: 890,
    isFree: false,
    price: 15000,
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
  },
  {
    id: "3",
    title: "Entrepreneurship in Africa",
    description: "Build and scale your business across African markets",
    category: "Business",
    level: "Intermediate",
    duration: 320,
    students: 2100,
    isFree: false,
    price: 25000,
    thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop",
  },
];

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

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {FEATURED_COURSES.map((course) => (
            <Link key={course.id} href={`/learn/${course.id}`}>
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full group">
                <div className="relative h-48 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 group-hover:scale-110 transition-transform duration-300"
                    style={{
                      backgroundImage: `url(${course.thumbnail})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  {course.isFree && (
                    <Badge 
                      className="absolute top-4 right-4 text-white"
                      style={{ background: "var(--success)" }}
                    >
                      Free
                    </Badge>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {course.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {course.level}
                    </Badge>
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
                        <>{course.price?.toLocaleString()} CFA</>
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
              </Card>
            </Link>
          ))}
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
