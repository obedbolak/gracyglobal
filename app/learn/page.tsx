"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star,
  Search,
  Filter,
  Loader2
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  category: string;
  level: string;
  price?: number;
  isFree: boolean;
  duration: number;
  students: number;
  sections: any[];
}

export default function LearnPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/learn");
      const data = await response.json();
      if (data.success) {
        setCourses(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
                         course.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || 
                         (filter === "free" && course.isFree) ||
                         (filter === "paid" && !course.isFree) ||
                         course.category.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--blue)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12" style={{ background: "var(--background)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Learn & Grow
          </h1>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            Access courses designed to empower you with knowledge and skills
          </p>
        </div>

        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ 
                border: "1px solid var(--divider)",
                background: "var(--background)",
                color: "var(--text-primary)"
              }}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "free" ? "default" : "outline"}
              onClick={() => setFilter("free")}
            >
              Free
            </Button>
            <Button
              variant={filter === "paid" ? "default" : "outline"}
              onClick={() => setFilter("paid")}
            >
              Paid
            </Button>
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>No courses found</h3>
            <p style={{ color: "var(--text-secondary)" }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                  {course.thumbnail && (
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{course.category}</Badge>
                    <Badge variant="outline">{course.level}</Badge>
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                    {course.title}
                  </h3>
                  <p className="mb-4 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {course.students} enrolled
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {course.sections.length} sections
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                      {course.isFree ? "Free" : `${(course.price || 0).toLocaleString()} CFA`}
                    </span>
                    <Button onClick={() => router.push(`/learn/${course.id}`)}>
                      View Course
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
